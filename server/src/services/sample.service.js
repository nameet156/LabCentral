const mongoose = require('mongoose');
const Sample = require('../models/Sample');
const AuditLog = require('../models/AuditLog');
const { generateSampleCode } = require('../utils/sampleCode');
const { validateTransition } = require('../utils/stateMachine');

/**
 * Create a new sample with auto-generated code.
 * Writes both the sample and a CREATED audit log entry in a transaction.
 */
const createSample = async ({ type, assignedTo, notes, userId }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sampleCode = await generateSampleCode();

    const sampleData = {
      sampleCode,
      type,
      status: 'received',
      assignedTo: assignedTo || null,
      createdBy: userId,
      notes: [],
    };

    // If an initial note was provided, add it
    if (notes) {
      sampleData.notes.push({
        text: notes,
        author: userId,
      });
    }

    const [sample] = await Sample.create([sampleData], { session });

    // Write CREATED audit log
    await AuditLog.create(
      [
        {
          sampleId: sample._id,
          action: 'CREATED',
          previousStatus: null,
          newStatus: 'received',
          performedBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Populate references before returning
    await sample.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'notes.author', select: 'name email' },
    ]);

    return sample;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * List samples with filtering, pagination, and populated references.
 */
const listSamples = async ({ status, type, from, to, page, limit }) => {
  const filter = {};

  if (status) filter.status = status;
  if (type) filter.type = type;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to) filter.createdAt.$lte = to;
  }

  const skip = (page - 1) * limit;

  const [samples, total] = await Promise.all([
    Sample.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('notes.author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Sample.countDocuments(filter),
  ]);

  return {
    samples,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single sample by ID with full audit history.
 */
const getSampleById = async (sampleId) => {
  const sample = await Sample.findById(sampleId)
    .populate('createdBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .populate('notes.author', 'name email');

  if (!sample) {
    const error = new Error('Sample not found.');
    error.statusCode = 404;
    throw error;
  }

  // Fetch audit history
  const auditLog = await AuditLog.find({ sampleId: sample._id })
    .populate('performedBy', 'name email role')
    .sort({ timestamp: 1 })
    .lean();

  return { sample, auditLog };
};

/**
 * Update sample status with state-machine validation, optimistic concurrency,
 * and atomic audit log write via a MongoDB transaction.
 */
const updateSampleStatus = async ({ sampleId, newStatus, version, userId }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find sample with version check (optimistic concurrency)
    const sample = await Sample.findOne(
      { _id: sampleId, __v: version }
    ).session(session);

    if (!sample) {
      // Determine if it's a not-found or a version conflict
      const exists = await Sample.findById(sampleId).session(session);
      if (!exists) {
        const error = new Error('Sample not found.');
        error.statusCode = 404;
        throw error;
      }
      const error = new Error(
        'Conflict: this sample has been modified by another user. Please refresh and try again.'
      );
      error.statusCode = 409;
      throw error;
    }

    // Validate state machine transition
    const transition = validateTransition(sample.status, newStatus);
    if (!transition.valid) {
      const error = new Error(transition.message);
      error.statusCode = 400;
      throw error;
    }

    const previousStatus = sample.status;

    // Update the sample status and explicitly increment __v for concurrency control
    // (Mongoose only auto-increments __v on array modifications, not primitive fields)
    sample.status = newStatus;
    sample.increment();
    await sample.save({ session });

    // Write audit log entry atomically
    await AuditLog.create(
      [
        {
          sampleId: sample._id,
          action: 'STATUS_CHANGE',
          previousStatus,
          newStatus,
          performedBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Populate for the response
    await sample.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'notes.author', select: 'name email' },
    ]);

    return sample;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Add a note to a sample.
 */
const addNote = async ({ sampleId, text, userId }) => {
  const sample = await Sample.findById(sampleId);

  if (!sample) {
    const error = new Error('Sample not found.');
    error.statusCode = 404;
    throw error;
  }

  sample.notes.push({ text, author: userId });
  await sample.save();

  await sample.populate([
    { path: 'createdBy', select: 'name email role' },
    { path: 'assignedTo', select: 'name email role' },
    { path: 'notes.author', select: 'name email' },
  ]);

  return sample;
};

/**
 * Get audit log entries for a sample.
 */
const getAuditLog = async (sampleId) => {
  // Verify sample exists
  const exists = await Sample.findById(sampleId);
  if (!exists) {
    const error = new Error('Sample not found.');
    error.statusCode = 404;
    throw error;
  }

  const auditLog = await AuditLog.find({ sampleId })
    .populate('performedBy', 'name email role')
    .sort({ timestamp: 1 })
    .lean();

  return auditLog;
};

module.exports = {
  createSample,
  listSamples,
  getSampleById,
  updateSampleStatus,
  addNote,
  getAuditLog,
};

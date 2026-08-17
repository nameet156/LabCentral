const mongoose = require('mongoose');

const SAMPLE_STATUSES = ['received', 'in_progress', 'qc_review', 'completed', 'rejected'];
const SAMPLE_TYPES = ['water', 'food', 'soil'];

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const sampleSchema = new mongoose.Schema(
  {
    sampleCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: SAMPLE_TYPES,
        message: 'Type must be one of: water, food, soil',
      },
      required: [true, 'Sample type is required'],
    },
    status: {
      type: String,
      enum: {
        values: SAMPLE_STATUSES,
        message: 'Invalid sample status',
      },
      default: 'received',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: [noteSchema],
  },
  {
    timestamps: true,
    // Mongoose versionKey (__v) is enabled by default — used for optimistic concurrency
  }
);

// Compound indexes for common query patterns
sampleSchema.index({ status: 1, type: 1 });
sampleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Sample', sampleSchema);
module.exports.SAMPLE_STATUSES = SAMPLE_STATUSES;
module.exports.SAMPLE_TYPES = SAMPLE_TYPES;

const sampleService = require('../services/sample.service');

/**
 * POST /api/samples
 */
const createSample = async (req, res, next) => {
  try {
    const sample = await sampleService.createSample({
      ...req.body,
      userId: req.userId,
    });
    res.status(201).json({ sample });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/samples
 */
const listSamples = async (req, res, next) => {
  try {
    const result = await sampleService.listSamples(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/samples/:id
 */
const getSampleById = async (req, res, next) => {
  try {
    const result = await sampleService.getSampleById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/samples/:id/status
 */
const updateSampleStatus = async (req, res, next) => {
  try {
    const sample = await sampleService.updateSampleStatus({
      sampleId: req.params.id,
      newStatus: req.body.status,
      version: req.body.version,
      userId: req.userId,
    });
    res.json({ sample });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/samples/:id/notes
 */
const addNote = async (req, res, next) => {
  try {
    const sample = await sampleService.addNote({
      sampleId: req.params.id,
      text: req.body.text,
      userId: req.userId,
    });
    res.json({ sample });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/samples/:id/audit-log
 */
const getAuditLog = async (req, res, next) => {
  try {
    const auditLog = await sampleService.getAuditLog(req.params.id);
    res.json({ auditLog });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSample,
  listSamples,
  getSampleById,
  updateSampleStatus,
  addNote,
  getAuditLog,
};

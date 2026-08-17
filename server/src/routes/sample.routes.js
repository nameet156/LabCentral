const express = require('express');
const sampleController = require('../controllers/sample.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createSampleSchema,
  updateStatusSchema,
  addNoteSchema,
  listSamplesQuerySchema,
} = require('../validators/sample.validator');

const router = express.Router();

// All sample routes require authentication
router.use(auth);

// GET /api/samples — all authenticated users can list
router.get('/', validate(listSamplesQuerySchema, 'query'), sampleController.listSamples);

// GET /api/samples/:id — all authenticated users can view
router.get('/:id', sampleController.getSampleById);

// POST /api/samples — only admin and technician can create
router.post(
  '/',
  authorize('admin', 'technician'),
  validate(createSampleSchema),
  sampleController.createSample
);

// PATCH /api/samples/:id/status — only admin and technician can change status
router.patch(
  '/:id/status',
  authorize('admin', 'technician'),
  validate(updateStatusSchema),
  sampleController.updateSampleStatus
);

// POST /api/samples/:id/notes — all authenticated users can add notes
router.post(
  '/:id/notes',
  validate(addNoteSchema),
  sampleController.addNote
);

// GET /api/samples/:id/audit-log — all authenticated users can view
router.get('/:id/audit-log', sampleController.getAuditLog);

module.exports = router;

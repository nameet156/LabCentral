const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    sampleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sample',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATED', 'STATUS_CHANGE', 'NOTE_ADDED'],
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Append-only: disable updates and deletes at the schema level
    // (enforced in code, not at DB level, but signals intent)
    versionKey: false,
  }
);

// Index for efficient lookups by sample + chronological order
auditLogSchema.index({ sampleId: 1, timestamp: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

const { z } = require('zod');

const createSampleSchema = z.object({
  type: z.enum(['water', 'food', 'soil'], {
    errorMap: () => ({ message: 'Type must be one of: water, food, soil' }),
  }),
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'assignedTo must be a valid ObjectId')
    .optional()
    .nullable(),
  notes: z
    .string()
    .trim()
    .min(1, 'Note text cannot be empty')
    .max(1000, 'Note text must be at most 1000 characters')
    .optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['received', 'in_progress', 'qc_review', 'completed', 'rejected'], {
    errorMap: () => ({
      message: 'Status must be one of: received, in_progress, qc_review, completed, rejected',
    }),
  }),
  version: z
    .number({ required_error: 'version is required for concurrency control' })
    .int('version must be an integer')
    .min(0, 'version must be non-negative'),
});

const addNoteSchema = z.object({
  text: z
    .string({ required_error: 'Note text is required' })
    .trim()
    .min(1, 'Note text cannot be empty')
    .max(1000, 'Note text must be at most 1000 characters'),
});

const listSamplesQuerySchema = z.object({
  status: z
    .enum(['received', 'in_progress', 'qc_review', 'completed', 'rejected'])
    .optional(),
  type: z.enum(['water', 'food', 'soil']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  createSampleSchema,
  updateStatusSchema,
  addNoteSchema,
  listSamplesQuerySchema,
};

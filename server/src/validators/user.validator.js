const { z } = require('zod');

const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  role: z
    .enum(['admin', 'technician', 'viewer'], {
      errorMap: () => ({ message: 'Role must be one of: admin, technician, viewer' }),
    })
    .optional(),
});

module.exports = {
  updateUserSchema,
};

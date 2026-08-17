/**
 * Zod validation middleware factory.
 * Validates req.body (or req.query/req.params) against a Zod schema.
 *
 * Usage:
 *   validate(registerSchema)            — validates req.body
 *   validate(querySchema, 'query')      — validates req.query
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return res.status(400).json({
        error: 'Validation failed.',
        details,
      });
    }

    // Replace the source with the parsed (and transformed) data
    req[source] = result.data;
    next();
  };
};

module.exports = validate;

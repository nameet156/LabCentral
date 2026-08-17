/**
 * Global error handler middleware.
 * Normalizes all errors into a consistent { error, details? } shape.
 */
const errorHandler = (err, req, res, _next) => {
  // Only log stack traces for unexpected server errors, not business logic errors
  if (!err.statusCode || err.statusCode >= 500) {
    console.error(`[Error] ${err.message}`, err.stack);
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ error: 'Validation failed.', details });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: `Duplicate value for field: ${field}.`,
    });
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: `Invalid value for ${err.path}: ${err.value}`,
    });
  }

  // Custom app errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Default: 500 Internal Server Error
  res.status(500).json({
    error: 'Internal server error.',
  });
};

module.exports = errorHandler;

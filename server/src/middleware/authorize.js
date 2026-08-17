/**
 * Role-based authorization middleware factory.
 * Usage: authorize('admin', 'technician')
 *
 * Must be used AFTER the auth middleware (req.user must exist).
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = authorize;

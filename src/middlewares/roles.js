const { AppError } = require('../utils/errors');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'Access denied'));
    }
    return next();
  };
}

module.exports = { requireRole };

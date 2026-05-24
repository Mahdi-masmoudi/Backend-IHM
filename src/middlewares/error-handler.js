const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const payload = {
    message: err.message || 'Unexpected error'
  };

  if (err.details) {
    payload.details = err.details;
  }

  res.status(statusCode).json(payload);
}

module.exports = { errorHandler };

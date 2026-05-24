const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { AppError } = require('../utils/errors');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new AppError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: Number.parseInt(payload.sub, 10),
      role: payload.role,
      email: payload.email
    };
    return next();
  } catch (error) {
    return next(new AppError(401, 'Invalid or expired token'));
  }
}

module.exports = { authenticate };

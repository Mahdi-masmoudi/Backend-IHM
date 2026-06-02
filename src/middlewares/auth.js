const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { AppError } = require('../utils/errors');
const User = require('../models/User');

async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token || token === 'null' || token === 'undefined') {
    return next(new AppError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const userId = payload.sub;

    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return next(new AppError(401, 'Invalid user ID in token'));
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return next(new AppError(401, 'User not found'));
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email
    };
    return next();
  } catch (error) {
    return next(new AppError(401, 'Invalid or expired token'));
  }
}

async function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token || token === 'null' || token === 'undefined') {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const userId = payload.sub;

    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return next();
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return next();
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email
    };
    return next();
  } catch (error) {
    // Treat invalid token as unauthenticated for optional auth routes
    return next();
  }
}

module.exports = { authenticate, optionalAuthenticate };

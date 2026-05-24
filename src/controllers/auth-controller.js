const authService = require('../services/auth-service');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function registerCandidat(req, res, next) {
  try {
    const result = await authService.registerCandidat(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function registerEntreprise(req, res, next) {
  try {
    const result = await authService.registerEntreprise(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function profile(req, res, next) {
  try {
    const result = await authService.getProfile(req.user.id, req.user.role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { register, registerCandidat, registerEntreprise, login, profile };

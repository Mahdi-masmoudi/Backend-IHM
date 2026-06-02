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

async function parseCv(req, res, next) {
  try {
    if (!req.file) {
      throw new Error('Un fichier CV (PDF ou DOCX) est requis');
    }
    const path = require('path');
    const cvParserService = require('../services/cv-parser-service');
    
    const filePath = path.resolve(req.file.path);
    const result = await cvParserService.parseCv(filePath);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { register, registerCandidat, registerEntreprise, login, profile, parseCv };

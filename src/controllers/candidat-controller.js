const { AppError } = require('../utils/errors');
const candidatService = require('../services/candidat-service');
const cvParserService = require('../services/cv-parser-service');
const path = require('path');

async function getProfile(req, res, next) {
  try {
    const profile = await candidatService.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await candidatService.updateProfile(req.user.id, req.body);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function addCv(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError(400, 'CV file is required');
    }
    const result = await candidatService.addCv(req.user.id, req.file.filename);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function addLettre(req, res, next) {
  try {
    const result = await candidatService.addLettre(req.user.id, req.body.contenu);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function uploadCvAnalyse(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError(400, 'Un fichier CV (PDF ou DOCX) est requis');
    }

    const filePath = path.resolve(req.file.path);
    const result = await cvParserService.parseCv(filePath);

    // Also save the CV in the database
    await candidatService.addCv(req.user.id, req.file.filename);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile, addCv, addLettre, uploadCvAnalyse };

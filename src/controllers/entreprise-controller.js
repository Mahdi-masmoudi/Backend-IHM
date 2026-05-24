const entrepriseService = require('../services/entreprise-service');

async function getProfile(req, res, next) {
  try {
    const profile = await entrepriseService.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await entrepriseService.updateProfile(req.user.id, req.body);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile };

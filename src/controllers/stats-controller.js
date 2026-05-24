const statsService = require('../services/stats-service');

async function globalStats(req, res, next) {
  try {
    const stats = await statsService.getGlobalStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

async function candidatStats(req, res, next) {
  try {
    const stats = await statsService.getCandidatStats(req.user.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

async function entrepriseStats(req, res, next) {
  try {
    const stats = await statsService.getEntrepriseStats(req.user.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

module.exports = { globalStats, candidatStats, entrepriseStats };

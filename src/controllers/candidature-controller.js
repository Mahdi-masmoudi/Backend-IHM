const candidatureService = require('../services/candidature-service');

async function create(req, res, next) {
  try {
    const result = await candidatureService.applyCandidature({
      candidatId: req.user.id,
      offreId: req.body.offreId,
      cvId: req.body.cvId,
      lettreId: req.body.lettreId,
      commentaire: req.body.commentaire
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function listMine(req, res, next) {
  try {
    const result = await candidatureService.listByCandidat(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function listByEntreprise(req, res, next) {
  try {
    const result = await candidatureService.listByEntreprise(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function listByOffre(req, res, next) {
  try {
    const result = await candidatureService.listByOffre({
      entrepriseId: req.user.id,
      offreId: req.params.id
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function accepter(req, res, next) {
  try {
    const result = await candidatureService.updateStatus({
      entrepriseId: req.user.id,
      idCandidature: req.params.id,
      statut: 'ACCEPTEE'
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function rejeter(req, res, next) {
  try {
    const result = await candidatureService.updateStatus({
      entrepriseId: req.user.id,
      idCandidature: req.params.id,
      statut: 'REJETEE'
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { create, listMine, listByOffre, listByEntreprise, accepter, rejeter };

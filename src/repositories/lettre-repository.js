const LettreMotivation = require('../models/LettreMotivation');

async function addLettre(candidatId, contenu) {
  return LettreMotivation.create({ candidatId, contenu });
}

async function findByCandidat(candidatId) {
  return LettreMotivation.find({ candidatId }).sort({ dateAjout: -1 }).lean();
}

async function findById(id) {
  return LettreMotivation.findById(id).lean();
}

module.exports = { addLettre, findByCandidat, findById };

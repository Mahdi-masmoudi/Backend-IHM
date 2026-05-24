const Cv = require('../models/Cv');

async function addCv(candidatId, nomFichier) {
  return Cv.create({ candidatId, nomFichier });
}

async function findByCandidat(candidatId) {
  return Cv.find({ candidatId }).sort({ dateAjout: -1 }).lean();
}

async function findById(id) {
  return Cv.findById(id).lean();
}

module.exports = { addCv, findByCandidat, findById };

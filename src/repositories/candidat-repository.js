const Candidat = require('../models/Candidat');
const Cv = require('../models/Cv');
const LettreMotivation = require('../models/LettreMotivation');

async function createCandidat({ userId, adresse, dateNaissance, niveauEtude, experience }) {
  return Candidat.create({ userId, adresse, dateNaissance, niveauEtude, experience });
}

async function getByUserId(userId) {
  const candidat = await Candidat.findOne({ userId }).lean();
  if (!candidat) return null;
  const cvs = await Cv.find({ candidatId: userId }).sort({ dateAjout: -1 }).lean();
  const lettres = await LettreMotivation.find({ candidatId: userId }).sort({ dateAjout: -1 }).lean();
  return { ...candidat, cvs, lettres };
}

async function updateCandidat(userId, payload) {
  return Candidat.findOneAndUpdate({ userId }, { $set: payload }, { new: true });
}

module.exports = { createCandidat, getByUserId, updateCandidat };

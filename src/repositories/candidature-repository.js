const Candidature = require('../models/Candidature');
const Offre = require('../models/Offre');
const User = require('../models/User');
const Entreprise = require('../models/Entreprise');

async function create({ candidatId, offreId, cvId, lettreId, commentaire }) {
  return Candidature.create({
    candidatId, offreId,
    cvId: cvId || null,
    lettreId: lettreId || null,
    commentaire: commentaire || ''
  });
}

async function findDuplicate(candidatId, offreId) {
  return Candidature.findOne({ candidatId, offreId }).lean();
}

async function findById(id) {
  return Candidature.findById(id).lean();
}

async function listByCandidat(candidatId) {
  const candidatures = await Candidature.find({ candidatId }).sort({ datePostulation: -1 }).lean();

  // Enrich with offre + entreprise info
  const offreIds = candidatures.map(c => c.offreId);
  const offres = await Offre.find({ _id: { $in: offreIds } }).lean();
  const offreMap = {};
  for (const o of offres) offreMap[o._id.toString()] = o;

  const entrepriseIds = [...new Set(offres.map(o => o.entrepriseId.toString()))];
  const entreprises = await Entreprise.find({ userId: { $in: entrepriseIds } }).lean();
  const entrepriseMap = {};
  for (const e of entreprises) entrepriseMap[e.userId.toString()] = e;

  return candidatures.map(c => {
    const o = offreMap[c.offreId.toString()] || {};
    const e = entrepriseMap[o.entrepriseId?.toString()] || {};
    return {
      ...c,
      titre: o.titre || '',
      typeContrat: o.typeContrat || '',
      localisation: o.localisation || '',
      salaire: o.salaire || 0,
      nomEntreprise: e.nomEntreprise || '',
      logo: e.logo || ''
    };
  });
}

async function listByOffre(offreId) {
  const candidatures = await Candidature.find({ offreId }).sort({ datePostulation: -1 }).lean();
  const userIds = candidatures.map(c => c.candidatId);
  const users = await User.find({ _id: { $in: userIds } }).select('-motDePasse').lean();
  const userMap = {};
  for (const u of users) userMap[u._id.toString()] = u;

  return candidatures.map(c => ({
    ...c,
    nom: userMap[c.candidatId.toString()]?.nom || '',
    prenom: userMap[c.candidatId.toString()]?.prenom || '',
    email: userMap[c.candidatId.toString()]?.email || ''
  }));
}

async function updateStatut(id, statut) {
  return Candidature.findByIdAndUpdate(id, { $set: { statut } }, { new: true });
}

module.exports = { create, findDuplicate, findById, listByCandidat, listByOffre, updateStatut };

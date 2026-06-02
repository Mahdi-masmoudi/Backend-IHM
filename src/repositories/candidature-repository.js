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
      idCandidature: c._id,
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

  const cvIds = candidatures.map(c => c.cvId).filter(Boolean);
  const cvs = await require('../models/Cv').find({ _id: { $in: cvIds } }).lean();
  const cvMap = {};
  for (const cv of cvs) cvMap[cv._id.toString()] = cv;

  const lettreIds = candidatures.map(c => c.lettreId).filter(Boolean);
  const lettres = await require('../models/LettreMotivation').find({ _id: { $in: lettreIds } }).lean();
  const lettreMap = {};
  for (const l of lettres) lettreMap[l._id.toString()] = l;

  const candidats = await require('../models/Candidat').find({ userId: { $in: userIds } }).lean();
  const candidatMap = {};
  for (const cand of candidats) candidatMap[cand.userId.toString()] = cand;

  return candidatures.map(c => {
    const u = userMap[c.candidatId.toString()] || {};
    const candProfile = candidatMap[c.candidatId.toString()] || {};
    const cvObj = c.cvId ? cvMap[c.cvId.toString()] : null;
    const lObj = c.lettreId ? lettreMap[c.lettreId.toString()] : null;

    return {
      ...c,
      idCandidature: c._id,
      nom: u.nom || '',
      prenom: u.prenom || '',
      email: u.email || '',
      telephone: u.telephone || candProfile.telephone || '',
      adresse: candProfile.adresse || '',
      niveauEtude: candProfile.niveauEtude || '',
      experience: candProfile.experience || 0,
      competences: candProfile.competences || [],
      langues: candProfile.langues || [],
      experienceDescription: candProfile.experienceDescription || '',
      cvNomFichier: cvObj ? cvObj.nomFichier : '',
      lettreContenu: lObj ? lObj.contenu : ''
    };
  });
}

async function listByEntreprise(entrepriseId) {
  // Find all offres belonging to this entreprise
  const offres = await Offre.find({ entrepriseId }).select('_id titre typeContrat localisation salaire').lean();
  const offreIds = offres.map(o => o._id);
  if (offreIds.length === 0) return [];

  const offreMap = {};
  for (const o of offres) offreMap[o._id.toString()] = o;

  // Find all candidatures for those offres
  const candidatures = await Candidature.find({ offreId: { $in: offreIds } }).sort({ datePostulation: -1 }).lean();
  const userIds = [...new Set(candidatures.map(c => c.candidatId))];
  
  const users = await User.find({ _id: { $in: userIds } }).select('-motDePasse').lean();
  const userMap = {};
  for (const u of users) userMap[u._id.toString()] = u;

  const cvIds = candidatures.map(c => c.cvId).filter(Boolean);
  const cvs = await require('../models/Cv').find({ _id: { $in: cvIds } }).lean();
  const cvMap = {};
  for (const cv of cvs) cvMap[cv._id.toString()] = cv;

  const lettreIds = candidatures.map(c => c.lettreId).filter(Boolean);
  const lettres = await require('../models/LettreMotivation').find({ _id: { $in: lettreIds } }).lean();
  const lettreMap = {};
  for (const l of lettres) lettreMap[l._id.toString()] = l;

  const candidats = await require('../models/Candidat').find({ userId: { $in: userIds } }).lean();
  const candidatMap = {};
  for (const cand of candidats) candidatMap[cand.userId.toString()] = cand;

  return candidatures.map(c => {
    const o = offreMap[c.offreId.toString()] || {};
    const u = userMap[c.candidatId.toString()] || {};
    const candProfile = candidatMap[c.candidatId.toString()] || {};
    const cvObj = c.cvId ? cvMap[c.cvId.toString()] : null;
    const lObj = c.lettreId ? lettreMap[c.lettreId.toString()] : null;

    return {
      ...c,
      idCandidature: c._id,
      nom: u.nom || '',
      prenom: u.prenom || '',
      email: u.email || '',
      telephone: u.telephone || candProfile.telephone || '',
      adresse: candProfile.adresse || '',
      niveauEtude: candProfile.niveauEtude || '',
      experience: candProfile.experience || 0,
      competences: candProfile.competences || [],
      langues: candProfile.langues || [],
      experienceDescription: candProfile.experienceDescription || '',
      titre: o.titre || '',
      typeContrat: o.typeContrat || '',
      localisation: o.localisation || '',
      salaire: o.salaire || 0,
      cvNomFichier: cvObj ? cvObj.nomFichier : '',
      lettreContenu: lObj ? lObj.contenu : ''
    };
  });
}

async function updateStatut(id, statut) {
  return Candidature.findByIdAndUpdate(id, { $set: { statut } }, { new: true });
}

module.exports = { create, findDuplicate, findById, listByCandidat, listByOffre, listByEntreprise, updateStatut };

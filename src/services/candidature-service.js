const { AppError } = require('../utils/errors');
const offreRepository = require('../repositories/offre-repository');
const candidatureRepository = require('../repositories/candidature-repository');
const cvRepository = require('../repositories/cv-repository');
const lettreRepository = require('../repositories/lettre-repository');

async function applyCandidature({ candidatId, offreId, cvId, lettreId, commentaire }) {
  const offre = await offreRepository.findById(offreId);
  if (!offre) {
    throw new AppError(404, 'Offre not found');
  }

  const existing = await candidatureRepository.findByCandidatAndOffre(candidatId, offreId);
  if (existing) {
    throw new AppError(409, 'Candidature already exists for this offer');
  }

  const cv = await cvRepository.findByIdForCandidat(cvId, candidatId);
  if (!cv) {
    throw new AppError(400, 'CV not found for this candidat');
  }

  const lettre = await lettreRepository.findByIdForCandidat(lettreId, candidatId);
  if (!lettre) {
    throw new AppError(400, 'Lettre de motivation not found for this candidat');
  }

  const datePostulation = new Date().toISOString();
  const idCandidature = await candidatureRepository.createCandidature({
    candidatId,
    offreId,
    cvId,
    lettreId,
    datePostulation,
    statut: 'EN_ATTENTE',
    commentaire
  });

  return {
    idCandidature,
    candidatId,
    offreId,
    cvId,
    lettreId,
    datePostulation,
    statut: 'EN_ATTENTE',
    commentaire: commentaire || null
  };
}

async function listByOffre({ entrepriseId, offreId }) {
  const offre = await offreRepository.findById(offreId);
  if (!offre) {
    throw new AppError(404, 'Offre not found');
  }
  if (offre.entreprise_id !== entrepriseId) {
    throw new AppError(403, 'Access denied');
  }

  return candidatureRepository.listByOffre(offreId);
}

async function listByCandidat(candidatId) {
  return candidatureRepository.listByCandidat(candidatId);
}

async function listByEntreprise(entrepriseId) {
  return candidatureRepository.listByEntreprise(entrepriseId);
}

async function updateStatus({ entrepriseId, idCandidature, statut }) {
  const candidature = await candidatureRepository.findById(idCandidature);
  if (!candidature) {
    throw new AppError(404, 'Candidature not found');
  }

  const offre = await offreRepository.findById(candidature.offre_id);
  if (!offre || offre.entreprise_id !== entrepriseId) {
    throw new AppError(403, 'Access denied');
  }

  await candidatureRepository.updateStatus(idCandidature, statut);
  return { ...candidature, statut };
}

module.exports = { applyCandidature, listByOffre, listByCandidat, listByEntreprise, updateStatus };

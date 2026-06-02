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

  const existing = await candidatureRepository.findDuplicate(candidatId, offreId);
  if (existing) {
    throw new AppError(409, 'Candidature already exists for this offer');
  }

  if (cvId) {
    const cv = await cvRepository.findById(cvId);
    if (!cv || String(cv.candidatId) !== String(candidatId)) {
      throw new AppError(400, 'CV not found for this candidat');
    }
  }

  if (lettreId) {
    const lettre = await lettreRepository.findById(lettreId);
    if (!lettre || String(lettre.candidatId) !== String(candidatId)) {
      throw new AppError(400, 'Lettre de motivation not found for this candidat');
    }
  }

  const result = await candidatureRepository.create({
    candidatId,
    offreId,
    cvId,
    lettreId,
    commentaire
  });

  return {
    idCandidature: result._id,
    candidatId,
    offreId,
    cvId,
    lettreId,
    datePostulation: result.datePostulation,
    statut: 'EN_ATTENTE',
    commentaire: commentaire || null
  };
}

async function listByOffre({ entrepriseId, offreId }) {
  const offre = await offreRepository.findById(offreId);
  if (!offre) {
    throw new AppError(404, 'Offre not found');
  }
  if (String(offre.entrepriseId) !== String(entrepriseId)) {
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

  const offre = await offreRepository.findById(candidature.offreId);
  if (!offre || String(offre.entrepriseId) !== String(entrepriseId)) {
    throw new AppError(403, 'Access denied');
  }

  await candidatureRepository.updateStatut(idCandidature, statut);
  return { ...candidature, statut };
}

module.exports = { applyCandidature, listByOffre, listByCandidat, listByEntreprise, updateStatus };

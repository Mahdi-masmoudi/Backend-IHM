const { AppError } = require('../utils/errors');
const offreRepository = require('../repositories/offre-repository');

async function listOffers({
  q,
  typeContrat,
  localisation,
  statut,
  salaireMin,
  salaireMax,
  entreprise,
  sortBy,
  sortDirection,
  page,
  pageSize,
  entrepriseId
}) {
  return offreRepository.listOffers({
    q,
    typeContrat,
    localisation,
    statut,
    salaireMin,
    salaireMax,
    entreprise,
    sortBy,
    sortDirection,
    entrepriseId,
    page,
    pageSize
  });
}

async function getOffre(idOffre) {
  const offre = await offreRepository.findDetailsById(idOffre);
  if (!offre) {
    throw new AppError(404, 'Offre not found');
  }
  return offre;
}

async function createOffre({ entrepriseId, payload }) {
  const datePublication = new Date().toISOString();
  const idOffre = await offreRepository.createOffre({
    entrepriseId,
    titre: payload.titre,
    description: payload.description,
    typeContrat: payload.typeContrat,
    salaire: payload.salaire,
    localisation: payload.localisation,
    datePublication,
    statut: payload.statut,
    competences: payload.competences,
    experienceDemandee: payload.experienceDemandee
  });

  return getOffre(idOffre);
}

async function updateOffre({ entrepriseId, idOffre, payload }) {
  const offre = await getOffre(idOffre);
  if (offre.entreprise_id !== entrepriseId) {
    throw new AppError(403, 'Access denied');
  }

  await offreRepository.updateOffre(idOffre, payload);
  return getOffre(idOffre);
}

async function deleteOffre({ entrepriseId, idOffre }) {
  const offre = await getOffre(idOffre);
  if (offre.entreprise_id !== entrepriseId) {
    throw new AppError(403, 'Access denied');
  }

  await offreRepository.deleteOffre(idOffre);
}

module.exports = { listOffers, getOffre, createOffre, updateOffre, deleteOffre };

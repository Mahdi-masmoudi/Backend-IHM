const userRepository = require('../repositories/user-repository');
const offreRepository = require('../repositories/offre-repository');
const candidatRepository = require('../repositories/candidat-repository');
const entrepriseRepository = require('../repositories/entreprise-repository');

async function listUsers() {
  return userRepository.listUsers();
}

async function deleteUser(id) {
  await userRepository.deleteUser(id);
}

async function listOffres() {
  const result = await offreRepository.listOffers({ page: 1, pageSize: 200, q: null, typeContrat: null, localisation: null, statut: null, entrepriseId: null });
  return result.items;
}

async function listCandidats() {
  return candidatRepository.listCandidats();
}

async function listEntreprises() {
  return entrepriseRepository.listEntreprises();
}

async function deleteOffre(id) {
  await offreRepository.deleteOffre(id);
}

module.exports = { listUsers, deleteUser, listOffres, deleteOffre, listCandidats, listEntreprises };

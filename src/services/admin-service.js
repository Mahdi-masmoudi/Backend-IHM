const userRepository = require('../repositories/user-repository');
const offreRepository = require('../repositories/offre-repository');
const candidatRepository = require('../repositories/candidat-repository');
const entrepriseRepository = require('../repositories/entreprise-repository');
const Candidat = require('../models/Candidat');
const User = require('../models/User');

async function listUsers() {
  return userRepository.findAll();
}

async function deleteUser(id) {
  await userRepository.deleteUser(id);
}

async function listOffres() {
  const result = await offreRepository.listOffers({ page: 1, pageSize: 200, q: null, typeContrat: null, localisation: null, statut: null, entrepriseId: null });
  return result.items;
}

async function listCandidats() {
  const candidats = await Candidat.find().populate('userId', 'nom prenom email telephone').lean();
  return candidats;
}

async function listEntreprises() {
  return entrepriseRepository.findAll();
}

async function deleteOffre(id) {
  await offreRepository.deleteOffre(id);
}

module.exports = { listUsers, deleteUser, listOffres, deleteOffre, listCandidats, listEntreprises };

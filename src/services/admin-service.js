const userRepository = require('../repositories/user-repository');
const offreRepository = require('../repositories/offre-repository');
const candidatRepository = require('../repositories/candidat-repository');
const entrepriseRepository = require('../repositories/entreprise-repository');
const Candidat = require('../models/Candidat');
const User = require('../models/User');

async function listUsers() {
  const User = require('../models/User');
  return User.find().select('-motDePasse').sort({ createdAt: -1 }).lean();
}

async function deleteUser(id) {
  const User = require('../models/User');
  await User.findByIdAndDelete(id);
}

async function listOffres() {
  const result = await offreRepository.listOffers({ page: 1, pageSize: 200, q: null, typeContrat: null, localisation: null, statut: null, entrepriseId: null });
  return result.items;
}

async function listCandidats() {
  const User = require('../models/User');
  const Candidat = require('../models/Candidat');

  const candidats = await Candidat.find().lean();
  const userIds = candidats.map(c => c.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = {};
  for (const u of users) {
    userMap[u._id.toString()] = u;
  }

  return candidats.map(c => {
    const u = userMap[c.userId.toString()] || {};
    return {
      ...c,
      id: u._id || c.userId,
      nom: u.nom || '',
      prenom: u.prenom || '',
      email: u.email || '',
      telephone: u.telephone || ''
    };
  });
}

async function listEntreprises() {
  const User = require('../models/User');
  const Entreprise = require('../models/Entreprise');

  const companies = await Entreprise.find().lean();
  const userIds = companies.map(c => c.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = {};
  for (const u of users) {
    userMap[u._id.toString()] = u;
  }

  return companies.map(c => {
    const u = userMap[c.userId.toString()] || {};
    return {
      ...c,
      id: u._id || c.userId,
      nom: u.nom || '',
      prenom: u.prenom || '',
      email: u.email || '',
      telephone: u.telephone || ''
    };
  });
}

async function deleteOffre(id) {
  await offreRepository.deleteOffre(id);
}

module.exports = { listUsers, deleteUser, listOffres, deleteOffre, listCandidats, listEntreprises };

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

async function toggleUserStatus(id) {
  const User = require('../models/User');
  const user = await User.findById(id);
  if (!user) throw new Error('Utilisateur non trouvé');
  user.isActive = !user.isActive;
  await user.save();
  return user;
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

async function getCandidatApplications(userId) {
  const Candidature = require('../models/Candidature');
  const candidatures = await Candidature.find({ candidatId: userId })
    .populate({
      path: 'offreId',
      select: 'titre localisation statut entrepriseId',
      populate: {
        path: 'entrepriseId',
        select: 'nom'
      }
    })
    .sort({ datePostulation: -1 })
    .lean();

  return candidatures.map(app => {
    if (app.offreId && app.offreId.entrepriseId) {
      app.offreId.nomEntreprise = app.offreId.entrepriseId.nom;
    }
    return app;
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

async function getEntrepriseOffres(userId) {
  const Offre = require('../models/Offre');
  return Offre.find({ entrepriseId: userId }).sort({ datePublication: -1 }).lean();
}

module.exports = { listUsers, deleteUser, toggleUserStatus, listOffres, deleteOffre, listCandidats, getCandidatApplications, listEntreprises, getEntrepriseOffres };


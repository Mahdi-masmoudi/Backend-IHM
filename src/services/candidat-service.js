const { AppError } = require('../utils/errors');
const userRepository = require('../repositories/user-repository');
const candidatRepository = require('../repositories/candidat-repository');
const cvRepository = require('../repositories/cv-repository');
const lettreRepository = require('../repositories/lettre-repository');

async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  const candidat = await candidatRepository.getByUserId(userId);

  if (!user || !candidat) {
    throw new AppError(404, 'Candidat not found');
  }

  const cvs = await cvRepository.listByCandidat(userId);
  const lettres = await lettreRepository.listByCandidat(userId);

  return {
    userId: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: user.telephone,
    adresse: candidat.adresse,
    dateNaissance: candidat.dateNaissance,
    niveauEtude: candidat.niveauEtude,
    experience: candidat.experience,
    cvs,
    lettres
  };
}

async function updateProfile(userId, payload) {
  await candidatRepository.updateCandidat(userId, payload);
  return getProfile(userId);
}

async function addCv(userId, nomFichier) {
  const dateAjout = new Date().toISOString();
  const idCV = await cvRepository.createCv({
    candidatId: userId,
    nomFichier,
    dateAjout
  });

  return {
    idCV,
    nomFichier,
    dateAjout
  };
}

async function addLettre(userId, contenu) {
  const dateAjout = new Date().toISOString();
  const idLettre = await lettreRepository.createLettre({
    candidatId: userId,
    contenu,
    dateAjout
  });

  return {
    idLettre,
    contenu,
    dateAjout
  };
}

module.exports = { getProfile, updateProfile, addCv, addLettre };

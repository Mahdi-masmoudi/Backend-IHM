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

  const cvs = await cvRepository.findByCandidat(userId);
  const lettres = await lettreRepository.findByCandidat(userId);

  return {
    userId: user._id || user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: user.telephone,
    adresse: candidat.adresse,
    dateNaissance: candidat.dateNaissance,
    niveauEtude: candidat.niveauEtude,
    experience: candidat.experience,
    competences: candidat.competences || [],
    langues: candidat.langues || [],
    experienceDescription: candidat.experienceDescription || '',
    cvs: (cvs || []).map(cv => ({ idCV: cv._id, nomFichier: cv.nomFichier, dateAjout: cv.dateAjout })),
    lettres: (lettres || []).map(l => ({ idLettre: l._id, contenu: l.contenu, dateAjout: l.dateAjout }))
  };
}

async function updateProfile(userId, payload) {
  // Mettre à jour les champs du modèle User si présents dans le payload
  const userFields = {};
  if (payload.nom !== undefined) userFields.nom = payload.nom;
  if (payload.prenom !== undefined) userFields.prenom = payload.prenom;
  if (payload.telephone !== undefined) userFields.telephone = payload.telephone;

  if (Object.keys(userFields).length > 0) {
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, { $set: userFields });
  }

  await candidatRepository.updateCandidat(userId, payload);
  return getProfile(userId);
}

async function addCv(userId, nomFichier) {
  const cv = await cvRepository.addCv(userId, nomFichier);

  return {
    idCV: cv._id,
    nomFichier: cv.nomFichier,
    dateAjout: cv.dateAjout
  };
}

async function addLettre(userId, contenu) {
  const lettre = await lettreRepository.addLettre(userId, contenu);

  return {
    idLettre: lettre._id,
    contenu: lettre.contenu,
    dateAjout: lettre.dateAjout
  };
}

module.exports = { getProfile, updateProfile, addCv, addLettre };

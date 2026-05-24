const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { Roles } = require('../config/roles');
const { AppError } = require('../utils/errors');
const userRepository = require('../repositories/user-repository');
const candidatRepository = require('../repositories/candidat-repository');
const entrepriseRepository = require('../repositories/entreprise-repository');

function buildAuthResponse(user) {
  const userId = user._id || user.id;
  const token = jwt.sign(
    { role: user.role, email: user.email },
    env.jwtSecret,
    { subject: String(userId), expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    user: {
      id: userId,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email
    }
  };
}

async function register(payload) {
  return registerWithRole(payload, payload.role);
}

async function registerCandidat(payload) {
  return registerWithRole({ ...payload, role: Roles.CANDIDAT }, Roles.CANDIDAT);
}

async function registerEntreprise(payload) {
  return registerWithRole({ ...payload, role: Roles.ENTREPRISE }, Roles.ENTREPRISE);
}

async function registerWithRole(payload, role) {
  if (role === Roles.SUPER_ADMIN) {
    throw new AppError(400, 'Role not allowed for registration');
  }

  const existing = await userRepository.findByEmail(payload.email);
  if (existing) {
    throw new AppError(409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(payload.motDePasse, 10);

  try {
    const userId = await userRepository.createUser({
      nom: payload.nom,
      prenom: payload.prenom,
      email: payload.email,
      motDePasse: passwordHash,
      telephone: payload.telephone,
      role
    });

    if (role === Roles.CANDIDAT) {
      await candidatRepository.createCandidat({
        userId,
        adresse: payload.adresse,
        dateNaissance: payload.dateNaissance,
        niveauEtude: payload.niveauEtude,
        experience: payload.experience
      });
    }

    if (role === Roles.ENTREPRISE) {
      await entrepriseRepository.createEntreprise({
        userId,
        nomEntreprise: payload.nomEntreprise,
        adresseEntreprise: payload.adresseEntreprise,
        secteurActivite: payload.secteurActivite,
        description: payload.description,
        logo: payload.logo || null
      });
    }

    return buildAuthResponse({
      id: userId,
      nom: payload.nom,
      prenom: payload.prenom,
      email: payload.email,
      role
    });
  } catch (error) {
    throw error;
  }
}

async function login({ email, motDePasse }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const valid = await bcrypt.compare(motDePasse, user.motDePasse);
  if (!valid) {
    throw new AppError(401, 'Invalid credentials');
  }

  return buildAuthResponse(user);
}

async function getProfile(userId, role) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const safeUser = {
    id: user._id || user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: user.telephone,
    role: user.role
  };

  if (role === Roles.CANDIDAT) {
    const candidat = await candidatRepository.getByUserId(userId);
    return { ...safeUser, candidat };
  }

  if (role === Roles.ENTREPRISE) {
    const entreprise = await entrepriseRepository.getByUserId(userId);
    return { ...safeUser, entreprise };
  }

  return { ...safeUser };
}

module.exports = {
  register,
  registerCandidat,
  registerEntreprise,
  login,
  getProfile
};

const { AppError } = require('../utils/errors');
const entrepriseRepository = require('../repositories/entreprise-repository');

async function getProfile(userId) {
  const entreprise = await entrepriseRepository.getByUserId(userId);
  if (!entreprise) {
    throw new AppError(404, 'Entreprise not found');
  }

  return {
    userId: entreprise.user_id,
    nomEntreprise: entreprise.nomEntreprise,
    adresseEntreprise: entreprise.adresseEntreprise,
    secteurActivite: entreprise.secteurActivite,
    description: entreprise.description,
    logo: entreprise.logo || null
  };
}

async function updateProfile(userId, payload) {
  await entrepriseRepository.updateEntreprise(userId, payload);
  return getProfile(userId);
}

module.exports = { getProfile, updateProfile };

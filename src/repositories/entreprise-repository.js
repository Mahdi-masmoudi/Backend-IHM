const Entreprise = require('../models/Entreprise');

async function createEntreprise({ userId, nomEntreprise, adresseEntreprise, secteurActivite, description, logo }) {
  return Entreprise.create({ userId, nomEntreprise, adresseEntreprise, secteurActivite, description, logo: logo || '' });
}

async function getByUserId(userId) {
  return Entreprise.findOne({ userId }).lean();
}

async function updateEntreprise(userId, payload) {
  return Entreprise.findOneAndUpdate({ userId }, { $set: payload }, { new: true });
}

async function findAll() {
  return Entreprise.find().lean();
}

module.exports = { createEntreprise, getByUserId, updateEntreprise, findAll };

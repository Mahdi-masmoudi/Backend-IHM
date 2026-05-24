const Offre = require('../models/Offre');
const Entreprise = require('../models/Entreprise');
const Candidature = require('../models/Candidature');

async function createOffre({ entrepriseId, titre, description, typeContrat, salaire, localisation, datePublication, statut, competences, experienceDemandee }) {
  const offre = await Offre.create({
    entrepriseId, titre, description, typeContrat, salaire, localisation,
    datePublication: datePublication || new Date(), statut: statut || 'ACTIVE',
    competences: competences || '', experienceDemandee: experienceDemandee || 0
  });
  return offre._id;
}

async function updateOffre(idOffre, payload) {
  const allowed = ['titre', 'description', 'typeContrat', 'salaire', 'localisation', 'statut', 'competences', 'experienceDemandee'];
  const update = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) update[key] = payload[key];
  }
  return Offre.findByIdAndUpdate(idOffre, { $set: update }, { new: true });
}

async function deleteOffre(idOffre) {
  return Offre.findByIdAndDelete(idOffre);
}

async function findById(idOffre) {
  return Offre.findById(idOffre).lean();
}

async function findDetailsById(idOffre) {
  const offre = await Offre.findById(idOffre).lean();
  if (!offre) return null;
  const entreprise = await Entreprise.findOne({ userId: offre.entrepriseId }).lean();
  const candidaturesCount = await Candidature.countDocuments({ offreId: offre._id });
  return {
    ...offre,
    idOffre: offre._id,
    nomEntreprise: entreprise?.nomEntreprise || '',
    adresseEntreprise: entreprise?.adresseEntreprise || '',
    secteurActivite: entreprise?.secteurActivite || '',
    entrepriseDescription: entreprise?.description || '',
    logo: entreprise?.logo || '',
    candidaturesCount
  };
}

async function listOffers({ q, typeContrat, localisation, statut, salaireMin, salaireMax, entreprise, entrepriseId, sortBy, sortDirection, page, pageSize }) {
  const filter = {};

  if (q) {
    filter.$or = [
      { titre: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { competences: { $regex: q, $options: 'i' } }
    ];
  }
  if (typeContrat) filter.typeContrat = typeContrat;
  if (localisation) filter.localisation = { $regex: localisation, $options: 'i' };
  if (statut) filter.statut = statut;
  if (salaireMin != null) filter.salaire = { ...filter.salaire, $gte: salaireMin };
  if (salaireMax != null) filter.salaire = { ...filter.salaire, $lte: salaireMax };
  if (entrepriseId) filter.entrepriseId = entrepriseId;

  // If filtering by entreprise name, find matching entreprise IDs first
  if (entreprise) {
    const matchingEntreprises = await Entreprise.find({ nomEntreprise: { $regex: entreprise, $options: 'i' } }).select('userId').lean();
    const ids = matchingEntreprises.map(e => e.userId);
    filter.entrepriseId = { $in: ids };
  }

  const total = await Offre.countDocuments(filter);
  const sortField = sortBy === 'salaire' ? 'salaire' : 'datePublication';
  const sortDir = sortDirection === 'asc' ? 1 : -1;
  const skip = (page - 1) * pageSize;

  const offres = await Offre.find(filter)
    .sort({ [sortField]: sortDir })
    .skip(skip)
    .limit(pageSize)
    .lean();

  // Enrich with entreprise info
  const entrepriseIds = [...new Set(offres.map(o => o.entrepriseId.toString()))];
  const entreprises = await Entreprise.find({ userId: { $in: entrepriseIds } }).lean();
  const entrepriseMap = {};
  for (const e of entreprises) {
    entrepriseMap[e.userId.toString()] = e;
  }

  const items = offres.map(o => {
    const e = entrepriseMap[o.entrepriseId.toString()] || {};
    return {
      ...o,
      idOffre: o._id,
      nomEntreprise: e.nomEntreprise || '',
      secteurActivite: e.secteurActivite || '',
      logo: e.logo || ''
    };
  });

  return { total, items };
}

module.exports = { createOffre, updateOffre, deleteOffre, findById, findDetailsById, listOffers };

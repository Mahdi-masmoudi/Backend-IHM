const User = require('../models/User');
const Candidat = require('../models/Candidat');
const Entreprise = require('../models/Entreprise');
const Offre = require('../models/Offre');
const Candidature = require('../models/Candidature');
const Cv = require('../models/Cv');
const LettreMotivation = require('../models/LettreMotivation');

async function getGlobalStats() {
  const [
    totalUsers, totalCandidats, totalEntreprises, totalOffres, totalCandidatures,
    offresActives, candidaturesEnAttente, candidaturesAcceptees, candidaturesRejetees
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'CANDIDAT' }),
    User.countDocuments({ role: 'ENTREPRISE' }),
    Offre.countDocuments(),
    Candidature.countDocuments(),
    Offre.countDocuments({ statut: 'ACTIVE' }),
    Candidature.countDocuments({ statut: 'EN_ATTENTE' }),
    Candidature.countDocuments({ statut: 'ACCEPTEE' }),
    Candidature.countDocuments({ statut: 'REJETEE' })
  ]);

  const topEntreprisesPipeline = [
    { $lookup: { from: 'offres', localField: 'userId', foreignField: 'entrepriseId', as: 'offres' } },
    { $project: { nomEntreprise: 1, secteurActivite: 1, logo: 1, offresCount: { $size: '$offres' } } },
    { $sort: { offresCount: -1 } },
    { $limit: 5 }
  ];
  const topEntreprises = await Entreprise.aggregate(topEntreprisesPipeline);

  const recentOffresDocs = await Offre.find().sort({ datePublication: -1 }).limit(6).lean();
  const entrepriseIds = [...new Set(recentOffresDocs.map(o => o.entrepriseId))];
  const entreprisesMap = {};
  if (entrepriseIds.length > 0) {
    const entreprises = await Entreprise.find({ userId: { $in: entrepriseIds } }).lean();
    entreprises.forEach(e => entreprisesMap[e.userId.toString()] = e);
  }
  
  const recentOffres = recentOffresDocs.map(o => {
    const e = entreprisesMap[o.entrepriseId.toString()] || {};
    return { ...o, nomEntreprise: e.nomEntreprise || '', logo: e.logo || '', secteurActivite: e.secteurActivite || '' };
  });

  const offresByType = await Offre.aggregate([
    { $group: { _id: '$typeContrat', count: { $sum: 1 } } },
    { $project: { typeContrat: '$_id', count: 1, _id: 0 } }
  ]);

  const candidaturesByMonth = await Candidature.aggregate([
    { $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$datePostulation" } },
        count: { $sum: 1 }
    }},
    { $project: { month: '$_id', count: 1, _id: 0 } },
    { $sort: { month: -1 } },
    { $limit: 12 }
  ]);

  return {
    totalUsers, totalCandidats, totalEntreprises, totalOffres, totalCandidatures,
    offresActives, candidaturesEnAttente, candidaturesAcceptees, candidaturesRejetees,
    topEntreprises, recentOffres, offresByType, candidaturesByMonth
  };
}

async function getCandidatStats(userId) {
  const [
    totalCandidatures, enAttente, acceptees, rejetees, totalCvs, totalLettres,
    user, candidat
  ] = await Promise.all([
    Candidature.countDocuments({ candidatId: userId }),
    Candidature.countDocuments({ candidatId: userId, statut: 'EN_ATTENTE' }),
    Candidature.countDocuments({ candidatId: userId, statut: 'ACCEPTEE' }),
    Candidature.countDocuments({ candidatId: userId, statut: 'REJETEE' }),
    Cv.countDocuments({ candidatId: userId }),
    LettreMotivation.countDocuments({ candidatId: userId }),
    User.findById(userId).lean(),
    Candidat.findOne({ userId }).lean()
  ]);

  const recentCandidaturesDocs = await Candidature.find({ candidatId: userId }).sort({ datePostulation: -1 }).limit(5).lean();
  const offreIds = recentCandidaturesDocs.map(c => c.offreId);
  const offresMap = {};
  const entreprisesMap = {};
  
  if (offreIds.length > 0) {
    const offres = await Offre.find({ _id: { $in: offreIds } }).lean();
    offres.forEach(o => offresMap[o._id.toString()] = o);
    
    const entrepriseIds = [...new Set(offres.map(o => o.entrepriseId))];
    const entreprises = await Entreprise.find({ userId: { $in: entrepriseIds } }).lean();
    entreprises.forEach(e => entreprisesMap[e.userId.toString()] = e);
  }

  const recentCandidatures = recentCandidaturesDocs.map(c => {
    const o = offresMap[c.offreId.toString()] || {};
    const e = entreprisesMap[o.entrepriseId?.toString()] || {};
    return {
      ...c,
      titre: o.titre || '', typeContrat: o.typeContrat || '', localisation: o.localisation || '', salaire: o.salaire || 0,
      nomEntreprise: e.nomEntreprise || '', logo: e.logo || ''
    };
  });

  let completion = 0;
  const suggestions = [];

  if (user?.nom) completion += 10; else suggestions.push({ field: 'nom', message: 'Ajoutez votre nom', points: 10 });
  if (user?.prenom) completion += 10; else suggestions.push({ field: 'prenom', message: 'Ajoutez votre prénom', points: 10 });
  if (user?.email) completion += 10; else suggestions.push({ field: 'email', message: 'Ajoutez votre email', points: 10 });
  if (user?.telephone) completion += 10; else suggestions.push({ field: 'telephone', message: 'Ajoutez votre téléphone', points: 10 });
  if (candidat?.adresse) completion += 10; else suggestions.push({ field: 'adresse', message: 'Ajoutez votre adresse', points: 10 });
  if (candidat?.dateNaissance) completion += 5; else suggestions.push({ field: 'dateNaissance', message: 'Ajoutez votre date de naissance', points: 5 });
  if (candidat?.niveauEtude) completion += 10; else suggestions.push({ field: 'niveauEtude', message: 'Ajoutez votre niveau d\'étude', points: 10 });
  if (candidat?.experience > 0) completion += 10; else suggestions.push({ field: 'experience', message: 'Ajoutez vos années d\'expérience', points: 10 });
  if (totalCvs > 0) completion += 15; else suggestions.push({ field: 'cv', message: 'Uploadez votre CV pour +15%', points: 15 });
  if (totalLettres > 0) completion += 10; else suggestions.push({ field: 'lettre', message: 'Ajoutez une lettre de motivation pour +10%', points: 10 });

  return {
    totalCandidatures, enAttente, acceptees, rejetees, totalCvs, totalLettres,
    recentCandidatures, profileCompletion: completion, suggestions
  };
}

async function getEntrepriseStats(userId) {
  const [totalOffres, offresActives] = await Promise.all([
    Offre.countDocuments({ entrepriseId: userId }),
    Offre.countDocuments({ entrepriseId: userId, statut: 'ACTIVE' })
  ]);

  const offres = await Offre.find({ entrepriseId: userId }).select('_id titre').lean();
  const offreIds = offres.map(o => o._id);

  const [totalCandidatures, enAttente, acceptees] = await Promise.all([
    Candidature.countDocuments({ offreId: { $in: offreIds } }),
    Candidature.countDocuments({ offreId: { $in: offreIds }, statut: 'EN_ATTENTE' }),
    Candidature.countDocuments({ offreId: { $in: offreIds }, statut: 'ACCEPTEE' })
  ]);

  const recentCandidaturesDocs = await Candidature.find({ offreId: { $in: offreIds } }).sort({ datePostulation: -1 }).limit(10).lean();
  const candidatIds = [...new Set(recentCandidaturesDocs.map(c => c.candidatId))];
  const usersMap = {};
  if (candidatIds.length > 0) {
    const users = await User.find({ _id: { $in: candidatIds } }).select('-motDePasse').lean();
    users.forEach(u => usersMap[u._id.toString()] = u);
  }

  const offresMap = {};
  offres.forEach(o => offresMap[o._id.toString()] = o);

  const recentCandidatures = recentCandidaturesDocs.map(c => {
    const u = usersMap[c.candidatId.toString()] || {};
    const o = offresMap[c.offreId.toString()] || {};
    return {
      ...c,
      nom: u.nom || '', prenom: u.prenom || '', email: u.email || '',
      titre: o.titre || ''
    };
  });

  const candidaturesByOffrePipeline = [
    { $match: { offreId: { $in: offreIds } } },
    { $group: { _id: '$offreId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ];
  const byOffreGroups = await Candidature.aggregate(candidaturesByOffrePipeline);
  const candidaturesByOffre = byOffreGroups.map(g => ({
    titre: offresMap[g._id.toString()]?.titre || 'Inconnu',
    count: g.count
  }));

  return { totalOffres, offresActives, totalCandidatures, enAttente, acceptees, recentCandidatures, candidaturesByOffre };
}

module.exports = { getGlobalStats, getCandidatStats, getEntrepriseStats };

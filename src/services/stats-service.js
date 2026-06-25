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

  // 1. Nom (5%)
  if (user?.nom) completion += 5; 
  else suggestions.push({ field: 'nom', message: 'Ajoutez votre nom', points: 5 });

  // 2. Prénom (5%)
  if (user?.prenom) completion += 5; 
  else suggestions.push({ field: 'prenom', message: 'Ajoutez votre prénom', points: 5 });

  // 3. Email (10%)
  if (user?.email) completion += 10; 
  else suggestions.push({ field: 'email', message: 'Ajoutez votre email', points: 10 });

  // 4. Téléphone (10%)
  if (user?.telephone) completion += 10; 
  else suggestions.push({ field: 'telephone', message: 'Ajouter votre numéro de téléphone (+10% visibilité)', points: 10 });

  // 5. Adresse (10%)
  if (candidat?.adresse) completion += 10; 
  else suggestions.push({ field: 'adresse', message: 'Ajouter votre adresse de résidence (+10% visibilité)', points: 10 });

  // 6. Date de naissance (5%)
  if (candidat?.dateNaissance) completion += 5; 
  else suggestions.push({ field: 'dateNaissance', message: 'Saisir votre date de naissance (+5% visibilité)', points: 5 });

  // 7. Niveau d'études (10%)
  if (candidat?.niveauEtude) completion += 10; 
  else suggestions.push({ field: 'niveauEtude', message: 'Indiquer votre niveau d\'études (+10% visibilité)', points: 10 });

  // 8. Expérience (10%)
  if (candidat?.experience !== undefined && candidat?.experience >= 0 && (candidat?.experience > 0 || candidat?.experience === 0)) {
    // Si l'expérience est renseignée (même à 0), on valide le champ
    completion += 10;
  } else {
    suggestions.push({ field: 'experience', message: 'Préciser vos années d\'expérience (+10% visibilité)', points: 10 });
  }

  // 9. CV (25%)
  if (totalCvs > 0) completion += 25; 
  else suggestions.push({ field: 'cv', message: 'Uploadez votre CV pour être visible des recruteurs (+25% visibilité)', points: 25 });

  // 10. Compétences (min 3) (5%)
  if (candidat?.competences && candidat.competences.length >= 3) completion += 5; 
  else suggestions.push({ field: 'competences', message: 'Ajoutez au moins 3 compétences clés (+5% visibilité)', points: 5 });

  // 11. Langues (min 1) (5%)
  if (candidat?.langues && candidat.langues.length >= 1) completion += 5; 
  else suggestions.push({ field: 'langues', message: 'Renseignez au moins 1 langue parlée (+5% visibilité)', points: 5 });

  completion = Math.min(completion, 100);

  // Détermination du niveau candidat
  let niveau = 'Débutant';
  if (completion <= 30) niveau = 'Débutant';
  else if (completion <= 55) niveau = 'Intermédiaire';
  else if (completion <= 80) niveau = 'Avancé';
  else if (completion <= 95) niveau = 'Expert';
  else niveau = 'Superstar';

  return {
    totalCandidatures, enAttente, acceptees, rejetees, totalCvs, totalLettres,
    recentCandidatures, profileCompletion: completion, suggestions, niveau
  };
}

async function getEntrepriseStats(userId) {
  const [totalOffres, offresActives, user, entreprise] = await Promise.all([
    Offre.countDocuments({ entrepriseId: userId }),
    Offre.countDocuments({ entrepriseId: userId, statut: 'ACTIVE' }),
    User.findById(userId).lean(),
    Entreprise.findOne({ userId }).lean()
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

  // Calcul complétion profil Recruteur (Entreprise)
  let completion = 0;
  const suggestions = [];

  // 1. Nom entreprise (20%)
  if (entreprise?.nomEntreprise) completion += 20;
  else suggestions.push({ field: 'nomEntreprise', message: 'Renseignez le nom de l\'entreprise', points: 20 });

  // 2. Email professionnel (10%)
  if (user?.email) completion += 10;
  else suggestions.push({ field: 'email', message: 'Ajoutez votre adresse email professionnelle', points: 10 });

  // 3. Logo (15%)
  if (entreprise?.logo) completion += 15;
  else suggestions.push({ field: 'logo', message: 'Téléversez le logo de votre entreprise (+15% visibilité)', points: 15 });

  // 4. Description (25%)
  if (entreprise?.description) {
    if (entreprise.description.length >= 100) {
      completion += 25;
    } else {
      completion += 10;
      suggestions.push({ field: 'description', message: 'Allongez la description de votre entreprise à 100 caractères min pour +15%', points: 15 });
    }
  } else {
    suggestions.push({ field: 'description', message: 'Ajoutez une description détaillée de votre entreprise (+25% visibilité)', points: 25 });
  }

  // 5. Adresse (15%)
  if (entreprise?.adresseEntreprise) completion += 15;
  else suggestions.push({ field: 'adresseEntreprise', message: 'Renseignez l\'adresse de l\'entreprise (+15% visibilité)', points: 15 });

  // 6. Secteur d'activité (15%)
  if (entreprise?.secteurActivite) completion += 15;
  else suggestions.push({ field: 'secteurActivite', message: 'Indiquez le secteur d\'activité (+15% visibilité)', points: 15 });

  // Détermination du niveau recruteur
  let niveau = 'Nouveau Recruteur';
  if (completion <= 35) niveau = 'Nouveau Recruteur';
  else if (completion <= 60) niveau = 'Recruteur Actif';
  else if (completion <= 80) niveau = 'Recruteur Certifié';
  else if (completion <= 95) niveau = 'Expert Recruteur';
  else niveau = 'Super Recruteur';

  return { 
    totalOffres, 
    offresActives, 
    totalCandidatures, 
    enAttente, 
    acceptees, 
    recentCandidatures, 
    candidaturesByOffre,
    profileCompletion: completion,
    suggestions,
    niveau
  };
}

module.exports = { getGlobalStats, getCandidatStats, getEntrepriseStats };

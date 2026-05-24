const bcrypt = require('bcryptjs');
const { env } = require('../config/env');
const { Roles } = require('../config/roles');
const User = require('../models/User');
const Candidat = require('../models/Candidat');
const Entreprise = require('../models/Entreprise');
const Offre = require('../models/Offre');
const Candidature = require('../models/Candidature');

async function seedSuperAdmin() {
  const existing = await User.findOne({ email: env.seedSuperAdminEmail });
  const hash = await bcrypt.hash(env.seedSuperAdminPassword, 10);

  if (existing) {
    existing.nom = env.seedSuperAdminNom;
    existing.prenom = env.seedSuperAdminPrenom;
    existing.motDePasse = hash;
    existing.telephone = env.seedSuperAdminTelephone;
    existing.role = Roles.SUPER_ADMIN;
    await existing.save();
    return;
  }

  await User.create({
    nom: env.seedSuperAdminNom,
    prenom: env.seedSuperAdminPrenom,
    email: env.seedSuperAdminEmail,
    motDePasse: hash,
    telephone: env.seedSuperAdminTelephone,
    role: Roles.SUPER_ADMIN
  });
}

async function seedDemoData() {
  const existingCandidat = await User.findOne({ email: 'ahmed.benali@email.com' });
  if (existingCandidat) return;

  const hash = await bcrypt.hash('Password123!', 10);

  // ── Entreprises ──────────────────────────────────────────────────
  const entreprisesData = [
    { nom: 'Dupont', prenom: 'Marie', email: 'marie.dupont@techcorp.ma', telephone: '0612345678', nomEntreprise: 'TechCorp Maroc', adresse: 'Casablanca, Bd Zerktouni', secteur: 'Technologies', description: 'Leader en solutions digitales et transformation numérique au Maroc. Expertise en développement web, mobile et cloud.' },
    { nom: 'Alami', prenom: 'Hassan', email: 'hassan@innov-rh.ma', telephone: '0623456789', nomEntreprise: 'InnovRH Solutions', adresse: 'Rabat, Agdal', secteur: 'Ressources Humaines', description: 'Cabinet de conseil en ressources humaines, spécialisé dans le recrutement et la gestion des talents.' },
    { nom: 'Martin', prenom: 'Sophie', email: 'sophie@datawave.ma', telephone: '0634567890', nomEntreprise: 'DataWave Analytics', adresse: 'Tanger, Zone Franche', secteur: 'Data & Analytics', description: 'Société spécialisée en big data, intelligence artificielle et business intelligence.' },
    { nom: 'El Fassi', prenom: 'Karim', email: 'karim@greenergy.ma', telephone: '0645678901', nomEntreprise: 'GreenErgy Solutions', adresse: 'Marrakech, Guéliz', secteur: 'Énergie Renouvelable', description: 'Solutions énergétiques durables et projets solaires pour entreprises et collectivités.' }
  ];

  const entreprisesMap = {};
  for (const e of entreprisesData) {
    const user = await User.create({ nom: e.nom, prenom: e.prenom, email: e.email, motDePasse: hash, telephone: e.telephone, role: Roles.ENTREPRISE });
    await Entreprise.create({ userId: user._id, nomEntreprise: e.nomEntreprise, adresseEntreprise: e.adresse, secteurActivite: e.secteur, description: e.description });
    entreprisesMap[e.email] = user._id;
  }

  // ── Candidats ────────────────────────────────────────────────────
  const candidatsData = [
    { nom: 'Benali', prenom: 'Ahmed', email: 'ahmed.benali@email.com', telephone: '0656789012', adresse: 'Casablanca, Maarif', dateNaissance: '1995-03-15', niveauEtude: 'Master (Bac+5)', experience: 3 },
    { nom: 'Zahra', prenom: 'Fatima', email: 'fatima.zahra@email.com', telephone: '0667890123', adresse: 'Rabat, Hassan', dateNaissance: '1997-07-22', niveauEtude: 'Ingénieur (Bac+5)', experience: 2 },
    { nom: 'Idrissi', prenom: 'Youssef', email: 'youssef.idrissi@email.com', telephone: '0678901234', adresse: 'Fès, Ville Nouvelle', dateNaissance: '1993-11-08', niveauEtude: 'Licence (Bac+3)', experience: 5 },
    { nom: 'Tazi', prenom: 'Sara', email: 'sara.tazi@email.com', telephone: '0689012345', adresse: 'Tanger, Centre', dateNaissance: '1998-01-30', niveauEtude: 'Bac+2', experience: 1 }
  ];

  const candidatsMap = {};
  for (const c of candidatsData) {
    const user = await User.create({ nom: c.nom, prenom: c.prenom, email: c.email, motDePasse: hash, telephone: c.telephone, role: Roles.CANDIDAT });
    await Candidat.create({ userId: user._id, adresse: c.adresse, dateNaissance: c.dateNaissance, niveauEtude: c.niveauEtude, experience: c.experience });
    candidatsMap[c.email] = user._id;
  }

  // ── Offres ───────────────────────────────────────────────────────
  const offresData = [
    { entrepriseId: entreprisesMap['marie.dupont@techcorp.ma'], titre: 'Développeur Full Stack Angular/Node.js', description: 'Rejoignez notre équipe pour développer des applications web modernes avec Angular et Node.js. Vous participerez à la conception, au développement et au déploiement de solutions innovantes.', typeContrat: 'CDI', salaire: 15000, localisation: 'Casablanca', statut: 'ACTIVE', competences: 'Angular,Node.js,TypeScript,MongoDB', experienceDemandee: 2 },
    { entrepriseId: entreprisesMap['marie.dupont@techcorp.ma'], titre: 'DevOps Engineer', description: 'Nous recherchons un ingénieur DevOps pour automatiser nos processus de déploiement et gérer notre infrastructure cloud AWS.', typeContrat: 'CDI', salaire: 18000, localisation: 'Casablanca', statut: 'ACTIVE', competences: 'Docker,Kubernetes,AWS,CI/CD,Jenkins', experienceDemandee: 3 },
    { entrepriseId: entreprisesMap['hassan@innov-rh.ma'], titre: 'Consultant RH Junior', description: 'Intégrez notre cabinet de conseil RH et accompagnez nos clients dans la gestion de leurs talents et processus de recrutement.', typeContrat: 'CDD', salaire: 8000, localisation: 'Rabat', statut: 'ACTIVE', competences: 'Communication,Recrutement,Gestion RH', experienceDemandee: 0 },
    { entrepriseId: entreprisesMap['hassan@innov-rh.ma'], titre: 'Chef de Projet Digital', description: 'Pilotez des projets de transformation digitale RH pour nos clients grands comptes.', typeContrat: 'CDI', salaire: 22000, localisation: 'Rabat', statut: 'ACTIVE', competences: 'Agile,Scrum,Jira,Management', experienceDemandee: 5 },
    { entrepriseId: entreprisesMap['sophie@datawave.ma'], titre: 'Data Scientist', description: 'Analysez et modélisez des données complexes pour aider nos clients à prendre des décisions stratégiques basées sur l\'IA et le Machine Learning.', typeContrat: 'CDI', salaire: 20000, localisation: 'Tanger', statut: 'ACTIVE', competences: 'Python,TensorFlow,SQL,Machine Learning', experienceDemandee: 2 },
    { entrepriseId: entreprisesMap['sophie@datawave.ma'], titre: 'Analyste Business Intelligence', description: 'Créez des dashboards et rapports interactifs pour transformer les données brutes en insights actionnables.', typeContrat: 'Stage', salaire: 4000, localisation: 'Tanger', statut: 'ACTIVE', competences: 'Power BI,SQL,Excel,Python', experienceDemandee: 0 },
    { entrepriseId: entreprisesMap['karim@greenergy.ma'], titre: 'Ingénieur Énergie Solaire', description: 'Conception et dimensionnement de centrales solaires photovoltaïques pour des projets industriels et résidentiels.', typeContrat: 'CDI', salaire: 16000, localisation: 'Marrakech', statut: 'ACTIVE', competences: 'AutoCAD,PVsyst,Énergie Solaire', experienceDemandee: 3 },
    { entrepriseId: entreprisesMap['karim@greenergy.ma'], titre: 'Technicien Maintenance', description: 'Assurer la maintenance préventive et corrective des installations solaires et éoliennes.', typeContrat: 'CDD', salaire: 7000, localisation: 'Marrakech', statut: 'ACTIVE', competences: 'Électricité,Maintenance,Sécurité', experienceDemandee: 1 },
    { entrepriseId: entreprisesMap['marie.dupont@techcorp.ma'], titre: 'UX/UI Designer', description: 'Concevez des interfaces utilisateur modernes et ergonomiques en utilisant Figma et les principes du Human Centered Design.', typeContrat: 'CDI', salaire: 14000, localisation: 'Casablanca', statut: 'ACTIVE', competences: 'Figma,Adobe XD,Prototyping,UX Research', experienceDemandee: 2 },
    { entrepriseId: entreprisesMap['sophie@datawave.ma'], titre: 'Développeur Python Backend', description: 'Développement d\'APIs RESTful et de microservices avec Python/Django pour notre plateforme data.', typeContrat: 'CDI', salaire: 16000, localisation: 'Tanger', statut: 'ACTIVE', competences: 'Python,Django,PostgreSQL,Docker,Redis', experienceDemandee: 3 }
  ];

  const createdOffres = [];
  for (const o of offresData) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    const offre = await Offre.create({ ...o, datePublication: d });
    createdOffres.push(offre);
  }

  // ── Candidatures ─────────────────────────────────────────────────
  if (createdOffres.length >= 7) {
    const ahmedId = candidatsMap['ahmed.benali@email.com'];
    const fatimaId = candidatsMap['fatima.zahra@email.com'];
    const youssefId = candidatsMap['youssef.idrissi@email.com'];

    const getPastDate = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    };

    await Candidature.create({ candidatId: ahmedId, offreId: createdOffres[0]._id, datePostulation: getPastDate(5), statut: 'EN_ATTENTE', commentaire: 'Très motivé par ce poste' });
    await Candidature.create({ candidatId: ahmedId, offreId: createdOffres[4]._id, datePostulation: getPastDate(3), statut: 'ACCEPTEE', commentaire: 'Candidature retenue' });
    await Candidature.create({ candidatId: fatimaId, offreId: createdOffres[0]._id, datePostulation: getPastDate(7), statut: 'EN_ATTENTE' });
    await Candidature.create({ candidatId: fatimaId, offreId: createdOffres[2]._id, datePostulation: getPastDate(2), statut: 'REJETEE' });
    await Candidature.create({ candidatId: youssefId, offreId: createdOffres[3]._id, datePostulation: getPastDate(10), statut: 'ACCEPTEE', commentaire: 'Très bon profil' });
    await Candidature.create({ candidatId: youssefId, offreId: createdOffres[6]._id, datePostulation: getPastDate(1), statut: 'EN_ATTENTE' });
  }

  console.log('[seed] Demo data seeded successfully');
}

module.exports = { seedSuperAdmin, seedDemoData };

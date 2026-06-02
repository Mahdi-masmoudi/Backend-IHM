const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { env } = require('./src/config/env');
const User = require('./src/models/User');
const Entreprise = require('./src/models/Entreprise');
const Offre = require('./src/models/Offre');

async function seed() {
  console.log('[seed] Starting database seeding...');
  
  try {
    // Connect to database
    await mongoose.connect(env.mongoUri);
    console.log('[seed] Connected to MongoDB');

    // 1. Check or Create Mock Companies
    let enterprises = await User.find({ role: 'ENTREPRISE' });
    
    if (enterprises.length === 0) {
      console.log('[seed] No recruiter companies found. Creating mock companies...');
      
      const passwordHash = await bcrypt.hash('password123', 10);
      
      // Company 1: Tunis Tech
      const user1 = await User.create({
        nom: 'Tunis Tech',
        prenom: 'Digital',
        email: 'recrutement@tunistech.tn',
        motDePasse: passwordHash,
        telephone: '71123456',
        role: 'ENTREPRISE'
      });
      await Entreprise.create({
        userId: user1._id,
        nomEntreprise: 'Tunis Tech',
        adresseEntreprise: 'Les Berges du Lac, Tunis',
        secteurActivite: 'Technologies de l\'information',
        description: 'Tunis Tech est un leader de la transformation digitale en Tunisie, développant des solutions cloud de pointe pour l\'e-commerce et la finance.',
        logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=60'
      });

      // Company 2: Poulina Group (Mock representation)
      const user2 = await User.create({
        nom: 'Poulina Group',
        prenom: 'RH',
        email: 'jobs@poulina.tn',
        motDePasse: passwordHash,
        telephone: '72345678',
        role: 'ENTREPRISE'
      });
      await Entreprise.create({
        userId: user2._id,
        nomEntreprise: 'Poulina Group',
        adresseEntreprise: 'Zone Industrielle, Tunis',
        secteurActivite: 'Énergie & Industrie',
        description: 'Poulina Group Holding est un des plus grands groupes privés en Tunisie, actif dans l\'agroalimentaire, l\'immobilier, et les services.',
        logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=60'
      });

      // Company 3: Tunisie Digital Agency
      const user3 = await User.create({
        nom: 'Tunisie Digital Agency',
        prenom: 'Talent',
        email: 'hr@tda.tn',
        motDePasse: passwordHash,
        telephone: '73123456',
        role: 'ENTREPRISE'
      });
      await Entreprise.create({
        userId: user3._id,
        nomEntreprise: 'Tunisie Digital Agency',
        adresseEntreprise: 'Route de Teniour, Sfax',
        secteurActivite: 'Marketing & Digital',
        description: 'TDA est une agence créative tunisienne spécialisée dans le design de produits digitaux, le branding premium et le développement d\'applications mobiles.',
        logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=60'
      });

      enterprises = [user1, user2, user3];
      console.log('[seed] Created 3 mock companies. Password for all: password123');
    } else {
      console.log(`[seed] Found ${enterprises.length} existing companies in database.`);
    }

    // 2. Clear Existing Offers
    console.log('[seed] Cleaning up previous job offers...');
    await Offre.deleteMany({});

    // 3. Seed Realistic Job Offers
    const sampleOffers = [
      {
        entrepriseIndex: 0, // Tunis Tech
        titre: 'Développeur Full-Stack Senior (Angular / Node.js)',
        description: 'Nous recherchons un Développeur Full-Stack Senior pour piloter le développement technique de notre nouvelle plateforme SaaS financière. Vous collaborerez avec l\'équipe Produit et DevOps pour concevoir des API robustes et des interfaces utilisateur fluides. Expérience requise sur Angular et Node.js.',
        typeContrat: 'CDI',
        salaire: 3800,
        localisation: 'Tunis, Les Berges du Lac',
        competences: 'Angular, Node.js, MongoDB, TypeScript, Git, CI/CD, Jest',
        experienceDemandee: 5
      },
      {
        entrepriseIndex: 0, // Tunis Tech
        titre: 'Product Designer UI/UX (Figma)',
        description: 'Tunis Tech s\'agrandit ! Nous recherchons un Product Designer UI/UX talentueux pour concevoir des expériences utilisateur exceptionnelles et intuitives. Vous travaillerez sur le design system de l\'entreprise et réaliserez des wireframes et des prototypes interactifs sous Figma.',
        typeContrat: 'CDI',
        salaire: 2800,
        localisation: 'Tunis, Charguia',
        competences: 'Figma, UI Design, UX Research, Wireframing, Prototyping, Design System',
        experienceDemandee: 3
      },
      {
        entrepriseIndex: 1, // Poulina Group
        titre: 'Ingénieur Cloud & DevOps Specialist',
        description: 'Rejoignez le pôle technologique de Poulina Group pour mener la transition vers des infrastructures hybrides. Vous serez responsable de l\'automatisation de nos pipelines d\'intégration et déploiement continus (CI/CD), de la conteneurisation des services et de l\'orchestration de nos clusters Kubernetes.',
        typeContrat: 'CDI',
        salaire: 4200,
        localisation: 'Tunis, Siège social',
        competences: 'Docker, Kubernetes, AWS, Terraform, Ansible, Jenkins, Bash, Linux',
        experienceDemandee: 4
      },
      {
        entrepriseIndex: 1, // Poulina Group
        titre: 'Stage de Fin d\'Études (PFE) - Développeur Java / Spring Boot',
        description: 'Sujet du stage PFE : Conception et réalisation d\'un tableau de bord intelligent de suivi de la performance des équipements industriels en temps réel. Vous utiliserez Java 17, Spring Boot, PostgreSQL et une architecture microservices.',
        typeContrat: 'Stage',
        salaire: 800,
        localisation: 'Sfax, Zone Industrielle',
        competences: 'Java, Spring Boot, PostgreSQL, REST APIs, Microservices, Maven, Git',
        experienceDemandee: 0
      },
      {
        entrepriseIndex: 2, // Tunisie Digital Agency
        titre: 'Développeur Frontend React / Next.js Junior',
        description: 'Tunisie Digital Agency recrute un intégrateur et développeur Frontend React/Next.js Junior pour rejoindre notre pôle de création d\'applications e-commerce interactives. Rigoureux, passionné par le responsive design et sensible aux performances web.',
        typeContrat: 'CDD',
        salaire: 1800,
        localisation: 'Sfax, Route de Teniour',
        competences: 'React, Next.js, HTML5, CSS3, TailwindCSS, JavaScript, Git',
        experienceDemandee: 1
      },
      {
        entrepriseIndex: 2, // Tunisie Digital Agency
        titre: 'Social Media Manager & Digital Marketer',
        description: 'Vous élaborerez la stratégie de communication digitale de nos clients sur les réseaux sociaux. Création de contenus visuels attractifs, modération de communauté, et gestion de campagnes publicitaires sponsorisées (Meta Ads, Google Ads).',
        typeContrat: 'CDI',
        salaire: 2100,
        localisation: 'Sfax, Centre-Ville',
        competences: 'Copywriting, Meta Ads, Canva, SEO, Google Analytics, Community Management',
        experienceDemandee: 2
      }
    ];

    for (const job of sampleOffers) {
      const companyUser = enterprises[job.entrepriseIndex];
      // Fetch corresponding company details
      const companyDetails = await Entreprise.findOne({ userId: companyUser._id });
      
      await Offre.create({
        entrepriseId: companyUser._id,
        titre: job.titre,
        description: job.description,
        typeContrat: job.typeContrat,
        salaire: job.salaire,
        localisation: job.localisation,
        statut: 'ACTIVE',
        competences: job.competences,
        experienceDemandee: job.experienceDemandee
      });
    }

    console.log(`[seed] Successfully seeded ${sampleOffers.length} gorgeous job offers!`);
    
  } catch (error) {
    console.error('[seed] Seeding failed with error:', error);
  } finally {
    // Disconnect
    await mongoose.disconnect();
    console.log('[seed] Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();

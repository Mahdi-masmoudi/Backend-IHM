const schemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  motDePasse TEXT NOT NULL,
  telephone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'CANDIDAT', 'ENTREPRISE')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS candidats (
  user_id INTEGER PRIMARY KEY,
  adresse TEXT NOT NULL,
  dateNaissance TEXT NOT NULL,
  niveauEtude TEXT NOT NULL,
  experience INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entreprises (
  user_id INTEGER PRIMARY KEY,
  nomEntreprise TEXT NOT NULL,
  adresseEntreprise TEXT NOT NULL,
  secteurActivite TEXT NOT NULL,
  description TEXT NOT NULL,
  logo TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS offres (
  idOffre INTEGER PRIMARY KEY AUTOINCREMENT,
  entreprise_id INTEGER NOT NULL,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  typeContrat TEXT NOT NULL,
  salaire REAL NOT NULL,
  localisation TEXT NOT NULL,
  datePublication TEXT NOT NULL,
  statut TEXT NOT NULL,
  competences TEXT,
  experienceDemandee INTEGER,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cv (
  idCV INTEGER PRIMARY KEY AUTOINCREMENT,
  candidat_id INTEGER NOT NULL,
  nomFichier TEXT NOT NULL,
  dateAjout TEXT NOT NULL,
  FOREIGN KEY (candidat_id) REFERENCES candidats(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lettres_motivation (
  idLettre INTEGER PRIMARY KEY AUTOINCREMENT,
  candidat_id INTEGER NOT NULL,
  contenu TEXT NOT NULL,
  dateAjout TEXT NOT NULL,
  FOREIGN KEY (candidat_id) REFERENCES candidats(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidatures (
  idCandidature INTEGER PRIMARY KEY AUTOINCREMENT,
  candidat_id INTEGER NOT NULL,
  offre_id INTEGER NOT NULL,
  cv_id INTEGER,
  lettre_id INTEGER,
  datePostulation TEXT NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('EN_ATTENTE', 'ACCEPTEE', 'REJETEE')),
  commentaire TEXT,
  FOREIGN KEY (candidat_id) REFERENCES candidats(user_id) ON DELETE CASCADE,
  FOREIGN KEY (offre_id) REFERENCES offres(idOffre) ON DELETE CASCADE,
  FOREIGN KEY (cv_id) REFERENCES cv(idCV) ON DELETE SET NULL,
  FOREIGN KEY (lettre_id) REFERENCES lettres_motivation(idLettre) ON DELETE SET NULL,
  UNIQUE (candidat_id, offre_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  readAt TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_offres_entreprise ON offres(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_offres_localisation ON offres(localisation);
CREATE INDEX IF NOT EXISTS idx_offres_type ON offres(typeContrat);
CREATE INDEX IF NOT EXISTS idx_offres_statut ON offres(statut);
CREATE INDEX IF NOT EXISTS idx_candidatures_offre ON candidatures(offre_id);
CREATE INDEX IF NOT EXISTS idx_candidatures_candidat ON candidatures(candidat_id);
`;

module.exports = { schemaSql };

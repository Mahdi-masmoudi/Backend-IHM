class User {
  constructor({ id, nom, prenom, email, telephone, role }) {
    this.id = id;
    this.nom = nom;
    this.prenom = prenom;
    this.email = email;
    this.telephone = telephone;
    this.role = role;
  }
}

class CandidatProfile {
  constructor({ userId, adresse, dateNaissance, niveauEtude, experience }) {
    this.userId = userId;
    this.adresse = adresse;
    this.dateNaissance = dateNaissance;
    this.niveauEtude = niveauEtude;
    this.experience = experience;
  }
}

class EntrepriseProfile {
  constructor({ userId, nomEntreprise, adresseEntreprise, secteurActivite, description }) {
    this.userId = userId;
    this.nomEntreprise = nomEntreprise;
    this.adresseEntreprise = adresseEntreprise;
    this.secteurActivite = secteurActivite;
    this.description = description;
  }
}

module.exports = { User, CandidatProfile, EntrepriseProfile };

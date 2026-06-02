const mongoose = require('mongoose');

const candidatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  adresse: { type: String, default: '' },
  dateNaissance: { type: String, default: '' },
  niveauEtude: { type: String, default: '' },
  experience: { type: Number, default: 0 },
  competences: [{ type: String }],
  langues: [{ type: String }],
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  photo: { type: String, default: '' },
  experienceDescription: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Candidat', candidatSchema);

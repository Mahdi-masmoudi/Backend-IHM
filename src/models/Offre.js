const mongoose = require('mongoose');

const offreSchema = new mongoose.Schema({
  entrepriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  typeContrat: { type: String, required: true },
  salaire: { type: Number, required: true },
  localisation: { type: String, required: true },
  datePublication: { type: Date, default: Date.now },
  statut: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'FERMEE'] },
  competences: { type: String, default: '' },
  experienceDemandee: { type: Number, default: 0 }
}, { timestamps: true });

offreSchema.index({ entrepriseId: 1 });
offreSchema.index({ localisation: 1 });
offreSchema.index({ typeContrat: 1 });
offreSchema.index({ statut: 1 });
offreSchema.index({ titre: 'text', description: 'text', competences: 'text' });

module.exports = mongoose.model('Offre', offreSchema);

const mongoose = require('mongoose');

const candidatureSchema = new mongoose.Schema({
  candidatId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offre', required: true },
  cvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv', default: null },
  lettreId: { type: mongoose.Schema.Types.ObjectId, ref: 'LettreMotivation', default: null },
  datePostulation: { type: Date, default: Date.now },
  statut: { type: String, default: 'EN_ATTENTE', enum: ['EN_ATTENTE', 'ACCEPTEE', 'REJETEE'] },
  commentaire: { type: String, default: '' },
  score: { type: Number, default: 0 }
}, { timestamps: true });

// Prevent double candidature
candidatureSchema.index({ candidatId: 1, offreId: 1 }, { unique: true });
candidatureSchema.index({ offreId: 1 });
candidatureSchema.index({ candidatId: 1 });

module.exports = mongoose.model('Candidature', candidatureSchema);

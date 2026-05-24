const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
  candidatId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nomFichier: { type: String, required: true },
  dateAjout: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Cv', cvSchema);

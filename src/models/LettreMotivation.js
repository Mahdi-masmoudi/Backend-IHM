const mongoose = require('mongoose');

const lettreSchema = new mongoose.Schema({
  candidatId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contenu: { type: String, required: true },
  dateAjout: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LettreMotivation', lettreSchema);

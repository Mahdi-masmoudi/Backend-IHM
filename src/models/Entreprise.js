const mongoose = require('mongoose');

const entrepriseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  nomEntreprise: { type: String, required: true },
  adresseEntreprise: { type: String, default: '' },
  secteurActivite: { type: String, default: '' },
  description: { type: String, default: '' },
  logo: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Entreprise', entrepriseSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  motDePasse: { type: String, required: true },
  telephone: { type: String, default: '' },
  role: { type: String, required: true, enum: ['SUPER_ADMIN', 'CANDIDAT', 'ENTREPRISE'] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);

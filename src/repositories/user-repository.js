const User = require('../models/User');

async function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

async function findById(id) {
  return User.findById(id);
}

async function createUser({ nom, prenom, email, motDePasse, telephone, role }) {
  const user = await User.create({ nom, prenom, email: email.toLowerCase(), motDePasse, telephone, role });
  return user._id;
}

async function findAll() {
  return User.find().select('-motDePasse').sort({ createdAt: -1 });
}

async function deleteUser(id) {
  return User.findByIdAndDelete(id);
}

module.exports = { findByEmail, findById, createUser, findAll, deleteUser };

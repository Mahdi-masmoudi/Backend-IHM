const adminService = require('../services/admin-service');

async function listUsers(req, res, next) {
  try {
    const users = await adminService.listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    await adminService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function listOffres(req, res, next) {
  try {
    const offres = await adminService.listOffres();
    res.json(offres);
  } catch (error) {
    next(error);
  }
}

async function listCandidats(req, res, next) {
  try {
    const candidats = await adminService.listCandidats();
    res.json(candidats);
  } catch (error) {
    next(error);
  }
}

async function listEntreprises(req, res, next) {
  try {
    const entreprises = await adminService.listEntreprises();
    res.json(entreprises);
  } catch (error) {
    next(error);
  }
}

async function deleteOffre(req, res, next) {
  try {
    await adminService.deleteOffre(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listUsers, deleteUser, listOffres, deleteOffre, listCandidats, listEntreprises };

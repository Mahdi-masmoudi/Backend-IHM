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

async function toggleUserStatus(req, res, next) {
  try {
    const user = await adminService.toggleUserStatus(req.params.id);
    res.json({ message: 'Statut mis à jour', isActive: user.isActive });
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

async function getCandidatApplications(req, res, next) {
  try {
    const candidatures = await adminService.getCandidatApplications(req.params.id);
    res.json(candidatures);
  } catch (error) {
    next(error);
  }
}

async function getEntrepriseOffres(req, res, next) {
  try {
    const offres = await adminService.getEntrepriseOffres(req.params.id);
    res.json(offres);
  } catch (error) {
    next(error);
  }
}

module.exports = { listUsers, deleteUser, toggleUserStatus, listOffres, deleteOffre, listCandidats, getCandidatApplications, listEntreprises, getEntrepriseOffres };

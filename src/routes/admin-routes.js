const express = require('express');

const adminController = require('../controllers/admin-controller');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { validateParams } = require('../middlewares/validate');
const { idParamSchema } = require('../dtos/common-dto');
const { Roles } = require('../config/roles');

const router = express.Router();

router.use(authenticate, requireRole(Roles.SUPER_ADMIN));

router.get('/users', adminController.listUsers);
router.delete('/users/:id', validateParams(idParamSchema), adminController.deleteUser);
router.patch('/users/:id/status', validateParams(idParamSchema), adminController.toggleUserStatus);

router.get('/offres', adminController.listOffres);
router.delete('/offres/:id', validateParams(idParamSchema), adminController.deleteOffre);

router.get('/candidats', adminController.listCandidats);
router.get('/candidats/:id/candidatures', validateParams(idParamSchema), adminController.getCandidatApplications);

router.get('/entreprises', adminController.listEntreprises);
router.get('/entreprises/:id/offres', validateParams(idParamSchema), adminController.getEntrepriseOffres);

module.exports = router;

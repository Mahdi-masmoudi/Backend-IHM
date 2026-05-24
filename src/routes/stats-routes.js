const express = require('express');
const statsController = require('../controllers/stats-controller');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { Roles } = require('../config/roles');

const router = express.Router();

router.get('/global', authenticate, requireRole(Roles.SUPER_ADMIN), statsController.globalStats);
router.get('/candidat', authenticate, requireRole(Roles.CANDIDAT), statsController.candidatStats);
router.get('/entreprise', authenticate, requireRole(Roles.ENTREPRISE), statsController.entrepriseStats);

module.exports = router;

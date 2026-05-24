const express = require('express');

const entrepriseController = require('../controllers/entreprise-controller');
const candidatureController = require('../controllers/candidature-controller');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { validateBody } = require('../middlewares/validate');
const { entrepriseUpdateSchema } = require('../dtos/entreprise-dto');
const { Roles } = require('../config/roles');

const router = express.Router();

router.use(authenticate, requireRole(Roles.ENTREPRISE));

router.get('/profile', entrepriseController.getProfile);
router.put('/profile', validateBody(entrepriseUpdateSchema), entrepriseController.updateProfile);
router.get('/candidatures', candidatureController.listByEntreprise);

module.exports = router;

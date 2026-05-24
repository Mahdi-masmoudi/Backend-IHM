const express = require('express');

const candidatureController = require('../controllers/candidature-controller');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { validateBody, validateParams } = require('../middlewares/validate');
const { candidatureCreateSchema } = require('../dtos/candidature-dto');
const { idParamSchema } = require('../dtos/common-dto');
const { Roles } = require('../config/roles');

const router = express.Router();

router.post('/', authenticate, requireRole(Roles.CANDIDAT), validateBody(candidatureCreateSchema), candidatureController.create);
router.get('/me', authenticate, requireRole(Roles.CANDIDAT), candidatureController.listMine);
router.get('/offre/:id', authenticate, requireRole(Roles.ENTREPRISE), validateParams(idParamSchema), candidatureController.listByOffre);
router.put('/:id/accepter', authenticate, requireRole(Roles.ENTREPRISE), validateParams(idParamSchema), candidatureController.accepter);
router.put('/:id/rejeter', authenticate, requireRole(Roles.ENTREPRISE), validateParams(idParamSchema), candidatureController.rejeter);

module.exports = router;

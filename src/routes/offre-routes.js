const express = require('express');

const offreController = require('../controllers/offre-controller');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { validateBody, validateParams } = require('../middlewares/validate');
const { offreCreateSchema, offreUpdateSchema } = require('../dtos/offre-dto');
const { idParamSchema } = require('../dtos/common-dto');
const { Roles } = require('../config/roles');

const router = express.Router();

router.get('/', authenticate, offreController.list);
router.get('/:id', authenticate, validateParams(idParamSchema), offreController.getById);
router.post('/', authenticate, requireRole(Roles.ENTREPRISE), validateBody(offreCreateSchema), offreController.create);
router.put('/:id', authenticate, requireRole(Roles.ENTREPRISE), validateParams(idParamSchema), validateBody(offreUpdateSchema), offreController.update);
router.delete('/:id', authenticate, requireRole(Roles.ENTREPRISE), validateParams(idParamSchema), offreController.remove);

module.exports = router;

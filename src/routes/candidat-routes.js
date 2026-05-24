const express = require('express');

const candidatController = require('../controllers/candidat-controller');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { validateBody } = require('../middlewares/validate');
const { cvUpload, cvAnalyseUpload } = require('../middlewares/upload');
const { candidatUpdateSchema, lettreSchema } = require('../dtos/candidat-dto');
const { Roles } = require('../config/roles');

const router = express.Router();

router.use(authenticate, requireRole(Roles.CANDIDAT));

router.get('/profile', candidatController.getProfile);
router.put('/profile', validateBody(candidatUpdateSchema), candidatController.updateProfile);
router.post('/cv', cvUpload.single('file'), candidatController.addCv);
router.post('/lettre', validateBody(lettreSchema), candidatController.addLettre);
router.post('/upload-cv-analyse', cvAnalyseUpload.single('file'), candidatController.uploadCvAnalyse);

module.exports = router;

const express = require('express');

const authController = require('../controllers/auth-controller');
const { authenticate } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const {
	registerSchema,
	loginSchema,
	candidatRegisterSchemaNoRole,
	entrepriseRegisterSchemaNoRole
} = require('../dtos/auth-dto');

const { cvAnalyseUpload } = require('../middlewares/upload');

const router = express.Router();

router.post('/parse-cv', cvAnalyseUpload.single('file'), authController.parseCv);
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/register/candidat', validateBody(candidatRegisterSchemaNoRole), authController.registerCandidat);
router.post('/register/entreprise', validateBody(entrepriseRegisterSchemaNoRole), authController.registerEntreprise);
router.post('/login', validateBody(loginSchema), authController.login);
router.get('/profile', authenticate, authController.profile);

module.exports = router;

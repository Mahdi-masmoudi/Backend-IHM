const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads');
const cvUploadDir = path.join(uploadDir, 'cv');

ensureDir(uploadDir);
ensureDir(cvUploadDir);

const env = {
  port: Number.parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recrutement',
  uploadDir,
  cvUploadDir,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  corsCredentials: process.env.CORS_CREDENTIALS === 'true',
  seedSuperAdmin: process.env.SEED_SUPER_ADMIN === 'true',
  seedSuperAdminEmail: process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@recrutement.local',
  seedSuperAdminPassword: process.env.SEED_SUPER_ADMIN_PASSWORD || 'Admin123!',
  seedSuperAdminNom: process.env.SEED_SUPER_ADMIN_NOM || 'Admin',
  seedSuperAdminPrenom: process.env.SEED_SUPER_ADMIN_PRENOM || 'Super',
  seedSuperAdminTelephone: process.env.SEED_SUPER_ADMIN_TELEPHONE || '0000000000'
};

module.exports = { env };

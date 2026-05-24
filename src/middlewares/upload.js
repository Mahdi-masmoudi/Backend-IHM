const path = require('path');
const multer = require('multer');
const { env } = require('../config/env');
const { AppError } = require('../utils/errors');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.cvUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

function cvFileFilter(req, file, cb) {
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new AppError(400, 'Le CV doit être un fichier PDF ou DOCX'));
  }
  return cb(null, true);
}

function pdfOnlyFilter(req, file, cb) {
  if (file.mimetype !== 'application/pdf') {
    return cb(new AppError(400, 'CV must be a PDF file'));
  }
  return cb(null, true);
}

const cvUpload = multer({
  storage,
  fileFilter: pdfOnlyFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const cvAnalyseUpload = multer({
  storage,
  fileFilter: cvFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = { cvUpload, cvAnalyseUpload };

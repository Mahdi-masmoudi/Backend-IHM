const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { env } = require('./config/env');
const { errorHandler } = require('./middlewares/error-handler');

const authRoutes = require('./routes/auth-routes');
const candidatRoutes = require('./routes/candidat-routes');
const entrepriseRoutes = require('./routes/entreprise-routes');
const offreRoutes = require('./routes/offre-routes');
const candidatureRoutes = require('./routes/candidature-routes');
const adminRoutes = require('./routes/admin-routes');
const statsRoutes = require('./routes/stats-routes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: env.corsCredentials
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/uploads', express.static(path.resolve(env.uploadDir)));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/candidats', candidatRoutes);
app.use('/entreprises', entrepriseRoutes);
app.use('/entreprise', entrepriseRoutes);
app.use('/offres', offreRoutes);
app.use('/candidatures', candidatureRoutes);
app.use('/admin', adminRoutes);
app.use('/stats', statsRoutes);

app.use(errorHandler);

module.exports = { app };

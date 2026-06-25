const app = require('../src/app');
const mongoose = require('mongoose');
const { env } = require('../src/config/env');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await mongoose.connect(env.mongoUri);
      isConnected = true;
      console.log('[vercel] Connected to MongoDB');
    } catch (error) {
      console.error('[vercel] MongoDB connection failed:', error.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  
  return app(req, res);
};

let isConnected = false;

module.exports = async (req, res) => {
  try {
    const app = require('../src/app');
    const mongoose = require('mongoose');
    const { env } = require('../src/config/env');

    if (!isConnected) {
      await mongoose.connect(env.mongoUri);
      isConnected = true;
      console.log('[vercel] Connected to MongoDB');
    }
    
    return app(req, res);
  } catch (error) {
    console.error('[vercel] CRASH:', error);
    return res.status(500).json({ 
      error: 'Cold start crash', 
      message: error.message, 
      stack: error.stack 
    });
  }
};

const mongoose = require('mongoose');
const { env } = require('../config/env');

async function connectDb() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('[db] Connected to MongoDB');
  } catch (error) {
    console.error('[db] MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = { connectDb };

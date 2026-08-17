const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  MONGODB_URI: process.env.MONGODB_URI || 'memory',
  USE_MEMORY_DB: process.env.USE_MEMORY_DB === 'true' || !process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

module.exports = env;

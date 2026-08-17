const mongoose = require('mongoose');
const env = require('./env');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = env.MONGODB_URI;

    // If USE_MEMORY_DB is set or no external URI is configured, use in-memory MongoDB
    if (env.USE_MEMORY_DB || uri === 'memory') {
      const { MongoMemoryReplSet } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryReplSet.create({
        replSet: { count: 1, storageEngine: 'wiredTiger' },
      });
      uri = mongoServer.getUri();
      console.log('📦 Using in-memory MongoDB replica set');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };

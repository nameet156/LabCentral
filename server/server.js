const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const env = require('./src/config/env');

const start = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🚀 LIMS server running on port ${env.PORT} (${env.NODE_ENV})`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

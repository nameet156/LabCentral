const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const sampleRoutes = require('./routes/sample.routes');
const reportRoutes = require('./routes/report.routes');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Global middleware ---
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// --- Serve static assets in production / single-service deployment ---
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// SPA fallback for non-API GET requests (compatible with Express 5)
const fs = require('fs');
const indexPath = path.resolve(__dirname, '../../client/dist/index.html');

app.get(/^(?!\/api).*/, (req, res, next) => {
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// --- 404 handler for unmatched routes ---
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// --- Global error handler (must be last) ---
app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const sampleRoutes = require('./routes/sample.routes');
const reportRoutes = require('./routes/report.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Global middleware ---
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/reports', reportRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// --- Global error handler (must be last) ---
app.use(errorHandler);

module.exports = app;

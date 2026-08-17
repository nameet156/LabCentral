const express = require('express');
const reportController = require('../controllers/report.controller');
const auth = require('../middleware/auth');

const router = express.Router();

// All report routes require authentication
router.use(auth);

// GET /api/reports/summary
router.get('/summary', reportController.getSummary);

module.exports = router;

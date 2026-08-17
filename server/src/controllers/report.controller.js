const Sample = require('../models/Sample');

/**
 * GET /api/reports/summary
 * Returns sample counts grouped by status and by type using MongoDB aggregation pipelines.
 * Uses $facet to run both aggregations in a single database round-trip.
 */
const getSummary = async (req, res, next) => {
  try {
    const [result] = await Sample.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { status: '$_id', count: 1, _id: 0 } },
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { type: '$_id', count: 1, _id: 0 } },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    res.json({
      summary: {
        total: result.total[0]?.count || 0,
        byStatus: result.byStatus,
        byType: result.byType,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary };

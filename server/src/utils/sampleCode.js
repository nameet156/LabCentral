const Sample = require('../models/Sample');

/**
 * Auto-generate a unique sample code in the format SMP-YYYY-NNNNN.
 * Uses the current year and an incrementing counter based on the
 * highest existing code for that year.
 *
 * Example: SMP-2026-00001, SMP-2026-00002, ...
 */
const generateSampleCode = async () => {
  const year = new Date().getFullYear();
  const prefix = `SMP-${year}-`;

  // Find the latest sample code for the current year
  const latest = await Sample.findOne(
    { sampleCode: { $regex: `^${prefix}` } },
    { sampleCode: 1 },
    { sort: { sampleCode: -1 } }
  );

  let nextNumber = 1;

  if (latest) {
    // Extract the numeric suffix and increment
    const currentNumber = parseInt(latest.sampleCode.split('-')[2], 10);
    nextNumber = currentNumber + 1;
  }

  // Pad to 5 digits
  const code = `${prefix}${String(nextNumber).padStart(5, '0')}`;
  return code;
};

module.exports = { generateSampleCode };

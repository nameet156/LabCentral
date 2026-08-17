/**
 * Sample status state machine.
 * Defines which transitions are allowed from each status.
 * Terminal states (completed, rejected) have no outgoing transitions.
 */

const TRANSITIONS = {
  received: ['in_progress', 'rejected'],
  in_progress: ['qc_review', 'rejected'],
  qc_review: ['completed', 'rejected'],
  completed: [],   // terminal
  rejected: [],    // terminal
};

/**
 * Check whether a status transition is valid.
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {{ valid: boolean, message?: string }}
 */
const validateTransition = (currentStatus, newStatus) => {
  const allowed = TRANSITIONS[currentStatus];

  if (!allowed) {
    return {
      valid: false,
      message: `Unknown current status: '${currentStatus}'.`,
    };
  }

  if (allowed.length === 0) {
    return {
      valid: false,
      message: `Status '${currentStatus}' is terminal — no further transitions are allowed.`,
    };
  }

  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      message: `Invalid status transition: '${currentStatus}' → '${newStatus}' is not allowed. Allowed transitions from '${currentStatus}': ${allowed.join(', ')}.`,
    };
  }

  return { valid: true };
};

module.exports = { TRANSITIONS, validateTransition };

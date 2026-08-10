const axios = require('axios');

// Perfect Corp reports task_status as running / success / error, but be liberal
// about synonyms so a renamed status does not silently break polling.
const SUCCESS_STATUSES = new Set(['success', 'succeed', 'succeeded', 'done', 'completed']);
const FAILED_STATUSES = new Set(['failed', 'error', 'aborted', 'cancelled', 'canceled']);
const PROCESSING_STATUSES = new Set([
  'processing', 'running', 'pending', 'queued', 'in_progress', 'created', 'started'
]);

// Default budget is kept just under the frontend API client's 90s request
// timeout so the backend is not still polling after the client has given up.
// VTO (cloth-v3) tasks are heavier than skin analysis, so 60s was tight; 80s
// gives more headroom while staying within the request ceiling.
const DEFAULT_INTERVAL_MS = 2000;
const DEFAULT_MAX_ATTEMPTS = 40;

async function pollTaskStatus(
  url,
  headers,
  { intervalMs = DEFAULT_INTERVAL_MS, maxAttempts = DEFAULT_MAX_ATTEMPTS } = {}
) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await axios.get(url, { headers });
    const data = response.data;

    const rawStatus = data.data?.task_status || data.status || '';
    const status = String(rawStatus).toLowerCase();

    if (SUCCESS_STATUSES.has(status)) {
      return data;
    }

    if (FAILED_STATUSES.has(status)) {
      const errorObj = data.data?.error;
      const errorCode = errorObj?.code || 'error_failed';
      const errorMsg = errorObj?.message || 'Task execution failed';
      const err = new Error(errorMsg);
      err.code = errorCode;
      throw err;
    }

    if (!PROCESSING_STATUSES.has(status)) {
      // Neither a terminal state nor a known in-progress state. Surface it so an
      // unexpected or renamed status is visible in logs instead of the request
      // silently spinning until the timeout with no explanation.
      console.warn(
        `pollTaskStatus: unrecognized task status "${rawStatus}" from ${url}; continuing to poll.`
      );
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
    attempts++;
  }

  const budgetSeconds = (intervalMs * maxAttempts) / 1000;
  throw new Error(`Polling timeout: task did not complete within ${budgetSeconds}s`);
}

module.exports = { pollTaskStatus };

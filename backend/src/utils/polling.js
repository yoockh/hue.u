const axios = require('axios');

async function pollTaskStatus(url, headers, { intervalMs = 2000, maxAttempts = 30 } = {}) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await axios.get(url, { headers });
    const data = response.data;

    const taskStatus = data.data?.task_status || data.status;

    if (taskStatus === 'success' || taskStatus === 'SUCCESS') {
      return data;
    }

    if (taskStatus === 'failed' || taskStatus === 'FAILED' || taskStatus === 'error' || taskStatus === 'ERROR') {
      const errorMsg = data.data?.error_message || data.error?.message || 'Task execution failed';
      const errorCode = data.data?.error_code || data.error?.code || 'error_failed';
      const err = new Error(errorMsg);
      err.code = errorCode;
      throw err;
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error('Polling timeout: Task did not complete in time');
}

module.exports = { pollTaskStatus };

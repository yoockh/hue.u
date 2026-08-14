const { AppError } = require('../utils/errorHandler');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An internal server error occurred.';
  let code = err.code || 'internal_server_error';

  if (err.name === 'MulterError') {
    statusCode = 400;
    code = 'upload_error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the 10MB limit.';
    } else {
      message = `File upload failed: ${err.message}`;
    }
  }

  if (err.isAxiosError) {
    statusCode = err.response?.status || 502;
    code = 'api_gateway_error';
    message = `Failed to connect to external API service: ${err.response?.data?.error_message || err.message}`;
  }

  // Log server-side failures with the full stack so they are visible in the
  // platform logs (e.g. `heroku logs --tail`). Without this a 500 surfaces to
  // the client but leaves no trace to debug from. Client errors (4xx) are
  // expected and kept quiet to avoid log noise. The response is unchanged.
  if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}] ${statusCode} ${code}:`, err);
  }

  res.status(statusCode).json({
    status: 'error',
    code,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorMiddleware;

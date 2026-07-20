const { AppError } = require('../utils/errorHandler');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan pada server.';
  let code = err.code || 'internal_server_error';

  if (err.name === 'MulterError') {
    statusCode = 400;
    code = 'upload_error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Ukuran file terlalu besar. Batas maksimal adalah 10MB.';
    } else {
      message = `Gagal mengunggah file: ${err.message}`;
    }
  }

  if (err.isAxiosError) {
    statusCode = err.response?.status || 502;
    code = 'api_gateway_error';
    message = `Gagal terhubung dengan layanan API eksternal: ${err.response?.data?.error_message || err.message}`;
  }

  res.status(statusCode).json({
    status: 'error',
    code,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorMiddleware;

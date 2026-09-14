import AppError from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
}

export function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.isOperational ? error.message : 'Internal server error';

  if (error.code === 'P2002') {
    statusCode = 409;
    message = `Duplicate value for ${error.meta?.target?.join(', ') || 'unique field'}.`;
  }

  if (error.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record was not found.';
  }

  if (error.name === 'MulterError' && error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'Image size must not exceed 5MB.';
  }

  if (error.name === 'MulterError') {
    statusCode = 400;
    message = message === 'Internal server error' ? error.message : message;
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(`${statusCode} ${req.method} ${req.originalUrl}: ${error.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}

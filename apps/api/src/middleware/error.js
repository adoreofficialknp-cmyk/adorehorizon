import logger from '../utils/logger.js';

export const errorMiddleware = (err, req, res, next) => {
  // Log with method + path for easier debugging
  logger.error(`${req.method} ${req.path} — ${err.message}`, err.stack);

  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';

const healthCheck = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (err) {
    logger.error('Health check failed:', err);
    res.status(503).json({ status: 'error', database: 'disconnected', error: err.message });
  }
};

export default healthCheck;

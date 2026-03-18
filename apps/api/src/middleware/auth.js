import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Hard-fail at startup if JWT_SECRET is missing in production.
// This prevents the app from silently running with a guessable secret.
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[FATAL] JWT_SECRET environment variable is not set. Refusing to start.');
    process.exit(1);
  } else {
    console.warn('[WARN] JWT_SECRET not set — using insecure dev default. Set it in .env');
  }
}

const SECRET = JWT_SECRET || 'dev-only-insecure-secret-do-not-use-in-production';

/**
 * Generate a signed JWT
 * @param {string} userId
 * @param {string} role
 * @returns {string}
 */
export const generateToken = (userId, role = 'user') => {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: '30d' });
};

/**
 * Middleware: require a valid JWT (any role)
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    logger.warn('authenticate middleware error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware: require a valid JWT AND role === 'admin'
 * Consolidates auth + role check in a single DB round-trip.
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);

    // Fast-path: reject non-admin from the JWT claim before hitting DB
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Double-check role from DB (source of truth) to guard against stale tokens
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.warn('requireAdmin middleware error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware: attach user to req if token is present, but never block the request.
 * Safe for public routes that benefit from knowing who the user is.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user) req.user = user;
    }
  } catch (_) { /* ignore — token is optional */ }
  next();
};

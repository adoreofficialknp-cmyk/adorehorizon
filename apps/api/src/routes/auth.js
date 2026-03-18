import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { generateToken, authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    // Build OR conditions only for identifiers that were actually provided.
    // Never include an empty {} in the OR array — Prisma treats {} as "match everything",
    // which would cause findFirst to always return a user and block every registration.
    const orConditions = [];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });

    const existing = await prisma.user.findFirst({ where: { OR: orConditions } });
    if (existing) {
      return res.status(409).json({ error: 'User with this email/phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const identifier = email ? { email } : { phone };

    const user = await prisma.user.create({
      data: {
        name: name || null,
        ...identifier,
        password: hashedPassword,
        role: 'user',
      },
    });

    const token = generateToken(user.id, user.role);
    logger.info(`New user registered: ${email || phone}`);

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    if (!password) return res.status(400).json({ error: 'Password is required' });
    if (!email && !phone) return res.status(400).json({ error: 'Email or phone is required' });

    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id, user.role);
    logger.info(`User logged in: ${email || phone}`);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      is_admin: user.role === 'admin',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/admin-login
 */
router.post('/admin-login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const token = generateToken(user.id, user.role);
    logger.info(`Admin logged in: ${email}`);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      is_admin: true,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      id:        user.id,
      name:      user.name,
      email:     user.email,
      phone:     user.phone,
      role:      user.role,
      picture:   user.picture,
      ring_size: user.ringSize,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/auth/me
 */
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { name, phone, ring_size } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name      !== undefined && { name }),
        ...(phone     !== undefined && { phone }),
        ...(ring_size !== undefined && { ringSize: ring_size }),
      },
    });

    res.json({
      id: updated.id, name: updated.name, email: updated.email,
      phone: updated.phone, role: updated.role,
      ring_size: updated.ringSize,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/users
 * Admin: list all users (paginated + searchable)
 */
router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const page   = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit  = Math.min(parseInt(req.query.limit) || 50, 100);
    const search = req.query.search?.trim() || '';

    const where = search
      ? {
          OR: [
            { name:  { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, createdAt: true, verified: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ items: users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

export default router;

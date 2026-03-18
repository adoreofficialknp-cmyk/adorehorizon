import express from 'express';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { requireAdmin, authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/reviews — Admin: list all reviews with pagination
 */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    const productId = req.query.productId;
    const verified  = req.query.verified;

    const where = {};
    if (productId)              where.productId = productId;
    if (verified !== undefined) where.verified = verified === 'true';

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          user:    { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

/**
 * POST /api/reviews — Submit a review (authenticated user)
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { productId, rating, title, body } = req.body;
    if (!productId || !rating) {
      return res.status(400).json({ error: 'productId and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.id,
        rating: parseInt(rating),
        title: title || null,
        body: body || null,
        verified: false,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    // Recompute product average rating
    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating:      agg._avg.rating || 0,
        reviewCount: agg._count.rating || 0,
      },
    });

    logger.info(`Review created for product ${productId} by user ${req.user.id}`);
    res.status(201).json(review);
  } catch (err) { next(err); }
});

/**
 * PUT /api/reviews/:id — Admin: approve/reject review
 */
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { verified, status } = req.body;
    // Support both `verified: true/false` and `status: 'approved'/'rejected'`
    const isVerified = verified !== undefined
      ? Boolean(verified)
      : status === 'approved';

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data:  { verified: isVerified },
    });
    res.json(review);
  } catch (err) { next(err); }
});

/**
 * DELETE /api/reviews/:id — Admin: delete review
 */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    await prisma.review.delete({ where: { id: req.params.id } });

    // Recompute product rating after deletion
    const agg = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating:      agg._avg.rating || 0,
        reviewCount: agg._count.rating || 0,
      },
    });

    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;

import express from 'express';
import prisma from '../utils/prisma.js';
import { requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validateCoupon, calculateDiscount } from '../utils/order-utils.js';

const router = express.Router();

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(coupons);
  } catch (err) { next(err); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount = 0, maxUses, active = true, expiresAt } = req.body;
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ error: 'code, discountType, discountValue are required' });
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return res.status(409).json({ error: 'Coupon code already exists' });

    const coupon = await prisma.coupon.create({
      data: {
        code:           code.toUpperCase(),
        discountType,
        discountValue:  parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount),
        maxUses:        maxUses ? parseInt(maxUses) : null,
        active,
        expiresAt:      expiresAt ? new Date(expiresAt) : null,
      },
    });
    res.status(201).json(coupon);
  } catch (err) { next(err); }
});

router.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { id: req.params.id } });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (err) { next(err); }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUses, active, expiresAt } = req.body;
    const data = {};
    if (code !== undefined)          data.code          = code.toUpperCase();
    if (discountType !== undefined)  data.discountType  = discountType;
    if (discountValue !== undefined) data.discountValue = parseFloat(discountValue);
    if (minOrderAmount !== undefined) data.minOrderAmount = parseFloat(minOrderAmount);
    if (maxUses !== undefined)       data.maxUses       = maxUses ? parseInt(maxUses) : null;
    if (active !== undefined)        data.active        = active;
    if (expiresAt !== undefined)     data.expiresAt     = expiresAt ? new Date(expiresAt) : null;

    const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data });
    res.json(coupon);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

/**
 * POST /api/coupons/apply
 * Validate coupon and return discount — increments usedCount atomically.
 */
router.post('/apply', optionalAuth, async (req, res, next) => {
  try {
    const { code, cart_total } = req.body;
    if (!code)                           return res.status(400).json({ error: 'Coupon code is required' });
    if (!cart_total || cart_total <= 0)  return res.status(400).json({ error: 'cart_total is required' });

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });

    const validation = validateCoupon(coupon, parseFloat(cart_total));
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    const discountAmount = calculateDiscount(parseFloat(cart_total), coupon);

    // Increment usedCount atomically so maxUses enforcement is accurate.
    await prisma.coupon.update({
      where: { id: coupon.id },
      data:  { usedCount: { increment: 1 } },
    });

    res.json({
      success: true,
      coupon:  { id: coupon.id, code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
      discount_amount: discountAmount,
      final_amount:    parseFloat(cart_total) - discountAmount,
    });
  } catch (err) { next(err); }
});

export default router;

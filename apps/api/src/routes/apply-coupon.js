/**
 * Backward-compat alias for POST /api/coupons/apply
 * Mounted at /api/apply-coupon
 */
import express from 'express';
import prisma from '../utils/prisma.js';
import { validateCoupon, calculateDiscount } from '../utils/order-utils.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { code, cart_total } = req.body;
    if (!code)                          return res.status(400).json({ error: 'Coupon code is required' });
    if (!cart_total || cart_total <= 0) return res.status(400).json({ error: 'cart_total is required' });

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
  } catch (err) {
    next(err);
  }
});

export default router;

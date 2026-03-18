import express from 'express';
import Razorpay from 'razorpay';
import prisma from '../utils/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/razorpay-test
 * Admin: test that Razorpay keys are valid by creating a minimal test order
 */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const settings = await prisma.settings.findFirst();
    const keyId     = settings?.razorpayKeyId     || process.env.RAZORPAY_KEY_ID;
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(503).json({ success: false, error: 'Razorpay credentials not configured' });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({ amount: 100, currency: 'INR', receipt: 'test_' + Date.now() });
    res.json({ success: true, message: 'Razorpay credentials valid', test_order_id: order.id, key_id: keyId });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Invalid Razorpay credentials: ' + err.message });
  }
});

export default router;

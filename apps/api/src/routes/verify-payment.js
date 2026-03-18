/**
 * Backward-compat alias — actual logic lives in payment.js
 * Mounted at /api/verify-payment
 */
import express from 'express';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { verifyRazorpaySignature } from '../utils/payment-verification.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const settings = await prisma.settings.findFirst();
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return res.status(503).json({ error: 'Razorpay not configured' });

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, keySecret);
    if (!isValid) return res.status(400).json({ error: 'Invalid payment signature' });

    const order = await prisma.order.findFirst({
      where: order_id ? { orderId: order_id } : { razorpayOrderId: razorpay_order_id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          orderStatus: 'processing',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      });
      logger.info(`Payment verified (alias route): ${order.orderId}`);
    }

    res.json({ success: true, message: 'Payment verified', order_id: order?.orderId });
  } catch (err) { next(err); }
});

export default router;

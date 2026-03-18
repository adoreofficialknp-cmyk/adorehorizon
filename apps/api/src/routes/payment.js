import express from 'express';
import Razorpay from 'razorpay';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { verifyRazorpaySignature } from '../utils/payment-verification.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get a live Razorpay instance using credentials stored in DB (falls back to env vars)
 */
async function getRazorpayInstance() {
  const settings = await prisma.settings.findFirst();
  const keyId     = settings?.razorpayKeyId     || process.env.RAZORPAY_KEY_ID;
  const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw Object.assign(new Error('Razorpay credentials not configured'), { status: 503 });
  }

  return { razorpay: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, keySecret };
}

/**
 * POST /api/payment/razorpay-order
 */
router.post('/razorpay-order', optionalAuth, async (req, res, next) => {
  try {
    const { order_id, amount, customer_email, customer_phone } = req.body;

    if (!order_id)                      return res.status(400).json({ error: 'order_id is required' });
    if (!amount || amount <= 0)         return res.status(400).json({ error: 'amount must be a positive number' });
    if (!customer_email)                return res.status(400).json({ error: 'customer_email is required' });

    const { razorpay, keyId } = await getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100), // convert to paise
      currency: 'INR',
      receipt: order_id,
      notes: { order_id, customer_email, customer_phone: customer_phone || '' },
    });

    await prisma.order.update({
      where: { orderId: order_id },
      data: { razorpayOrderId: razorpayOrder.id },
    }).catch(() => {}); // non-fatal if order doesn't exist yet

    logger.info(`Razorpay order created: ${razorpayOrder.id} for app order ${order_id}`);
    res.json({ razorpay_order_id: razorpayOrder.id, razorpay_key_id: keyId });
  } catch (err) { next(err); }
});

/**
 * POST /api/payment/verify-razorpay
 */
router.post('/verify-razorpay', optionalAuth, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required' });
    }

    const settings = await prisma.settings.findFirst();
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return res.status(503).json({ error: 'Razorpay not configured' });

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, keySecret);
    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed: invalid signature' });
    }

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
      logger.info(`Payment verified for order: ${order.orderId}, payment: ${razorpay_payment_id}`);
    }

    res.json({ success: true, message: 'Payment verified', order_id: order?.orderId });
  } catch (err) { next(err); }
});

/**
 * POST /api/payment/create-order (legacy alias — same logic as razorpay-order)
 */
router.post('/create-order', optionalAuth, async (req, res, next) => {
  try {
    const { order_id, amount, customer_email, customer_phone } = req.body;

    if (!order_id)              return res.status(400).json({ error: 'order_id is required' });
    if (!amount || amount <= 0) return res.status(400).json({ error: 'amount must be a positive number' });
    if (!customer_email)        return res.status(400).json({ error: 'customer_email is required' });

    const { razorpay, keyId } = await getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100),
      currency: 'INR',
      receipt: order_id,
      notes: { order_id, customer_email, customer_phone: customer_phone || '' },
    });

    await prisma.order.update({
      where: { orderId: order_id },
      data: { razorpayOrderId: razorpayOrder.id },
    }).catch(() => {});

    logger.info(`Razorpay order created (alias): ${razorpayOrder.id} for ${order_id}`);
    res.json({ razorpay_order_id: razorpayOrder.id, razorpay_key_id: keyId });
  } catch (err) { next(err); }
});

export default router;

import express from 'express';
import crypto from 'crypto';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/hooks/razorpay
 * Razorpay webhook — verifies HMAC signature and auto-updates order on payment events.
 * express.raw() is required here so req.body is a Buffer for HMAC verification.
 */
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (secret && signature) {
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(req.body)
        .digest('hex');
      if (expectedSig !== signature) {
        logger.warn('Razorpay webhook: invalid signature');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    let event;
    try { event = JSON.parse(req.body.toString()); }
    catch { return res.status(400).json({ error: 'Invalid JSON payload' }); }

    const { entity } = event.payload?.payment || {};
    if (!entity) return res.json({ received: true });

    const razorpayOrderId = entity.order_id;
    if (razorpayOrderId) {
      // Map Razorpay events to our status values
      let paymentStatus = null;
      let orderStatus   = null;

      switch (event.event) {
        case 'payment.captured':
          paymentStatus = 'paid';
          orderStatus   = 'processing';
          break;
        case 'payment.failed':
          paymentStatus = 'failed';
          orderStatus   = 'order_placed'; // order stays, payment failed
          break;
        case 'payment.authorized':
          paymentStatus = 'authorized';
          // don't change orderStatus until captured
          break;
        case 'refund.created':
        case 'refund.processed':
          paymentStatus = 'refunded';
          orderStatus   = 'cancelled';
          break;
        default:
          logger.info(`Unhandled webhook event: ${event.event}`);
          break;
      }

      const updateData = { razorpayPaymentId: entity.id };
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (orderStatus)   updateData.orderStatus   = orderStatus;

      await prisma.order.updateMany({
        where: { razorpayOrderId },
        data:  updateData,
      });
      logger.info(`Webhook processed: ${event.event} for ${razorpayOrderId} → paymentStatus=${paymentStatus}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Webhook processing error:', err);
    // Always return 200 to Razorpay so it doesn't keep retrying
    res.json({ received: true });
  }
});

export default router;

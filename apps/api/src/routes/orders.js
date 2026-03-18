import express from 'express';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/** GET /api/orders — Admin: all orders */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, payment_status } = req.query;
    const where = {};
    if (status) where.orderStatus = status;
    if (paymentStatus || payment_status) where.paymentStatus = paymentStatus || payment_status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { orderItems: true, user: { select: { id: true, name: true, email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
});

/** GET /api/orders/my — Current user's orders */
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) { next(err); }
});

/** GET /api/orders/:orderId — Single order by orderId string or UUID */
router.get('/:orderId', optionalAuth, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ orderId }, { id: orderId }] },
      include: { orderItems: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
});

/** PUT /api/orders/:id/status — Admin: update order/payment status */
router.put('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, order_status, payment_status } = req.body;
    const data = {};
    const finalOrderStatus   = orderStatus   || order_status;
    const finalPaymentStatus = paymentStatus || payment_status;
    if (finalOrderStatus)   data.orderStatus   = finalOrderStatus;
    if (finalPaymentStatus) data.paymentStatus = finalPaymentStatus;

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: { orderItems: true },
    });
    logger.info(`Order ${order.orderId} status updated → ${finalOrderStatus || order.orderStatus}`);
    res.json(order);
  } catch (err) { next(err); }
});

/** DELETE /api/orders/:id — Admin: cancel order (soft delete) */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.order.update({
      where: { id: req.params.id },
      data: { orderStatus: 'cancelled' },
    });
    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) { next(err); }
});

export default router;

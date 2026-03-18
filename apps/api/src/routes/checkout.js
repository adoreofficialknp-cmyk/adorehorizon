import express from 'express';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { generateOrderId } from '../utils/order-utils.js';
import { optionalAuth, authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/checkout/create-order
 */
router.post('/create-order', optionalAuth, async (req, res, next) => {
  try {
    const {
      items, customer_info, payment_method,
      total_amount, coupon_code, discount_amount = 0, shipping_cost = 0,
    } = req.body;

    if (!items?.length) return res.status(400).json({ error: 'items array is required' });

    const { name, email, phone, address } = customer_info || {};
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ error: 'customer_info: name, email, phone, address are all required' });
    }
    if (!['razorpay', 'cod'].includes(payment_method)) {
      return res.status(400).json({ error: 'payment_method must be "razorpay" or "cod"' });
    }
    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({ error: 'total_amount must be a positive number' });
    }

    const orderId = generateOrderId();

    const order = await prisma.order.create({
      data: {
        orderId,
        userId: req.user?.id || null,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: typeof address === 'string' ? { line1: address } : address,
        items,
        subtotal: total_amount,
        discountAmount: discount_amount,
        shippingCost: shipping_cost,
        totalAmount: total_amount - discount_amount + shipping_cost,
        couponCode: coupon_code || null,
        paymentMethod: payment_method,
        paymentStatus: payment_method === 'cod' ? 'cod' : 'pending',
        orderStatus: 'order_placed',
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId || item.id || null,
            name: item.name,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
            image: item.image || item.images?.[0] || null,
          })),
        },
      },
    });

    logger.info(`Order created: ${orderId}, method: ${payment_method}, amount: ${order.totalAmount}`);

    res.json({
      success: true,
      orderId,
      order_id: orderId,
      internal_id: order.id,
      payment_method,
      message: payment_method === 'cod' ? 'Order placed successfully' : 'Order created – proceed to payment',
    });
  } catch (err) { next(err); }
});

/**
 * GET /api/checkout — Admin: list all orders
 */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, payment_status, paymentStatus } = req.query;
    const where = {};
    if (status) where.orderStatus = status;
    if (payment_status || paymentStatus) where.paymentStatus = payment_status || paymentStatus;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { orderItems: true, user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
});

/**
 * GET /api/checkout/my — Authenticated user's orders
 */
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

/**
 * GET /api/checkout/:orderId
 */
router.get('/:orderId', async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { OR: [{ orderId: req.params.orderId }, { id: req.params.orderId }] },
      include: { orderItems: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
});

/**
 * PUT /api/checkout/:id/status — Admin: update order status
 */
router.put('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const data = {};
    if (orderStatus) data.orderStatus = orderStatus;
    if (paymentStatus) data.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: { orderItems: true },
    });
    logger.info(`Order status updated: ${order.orderId} → ${orderStatus || order.orderStatus}`);
    res.json(order);
  } catch (err) { next(err); }
});

export default router;

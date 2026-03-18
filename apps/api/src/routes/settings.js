import express from 'express';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// FIX: /public and /razorpay-key must be declared BEFORE /:id-style params.
// In the original, GET /public would match a dynamic param route if one existed.
// Explicit static paths always go first.

/** GET /api/settings/public — Non-sensitive public settings */
router.get('/public', async (req, res, next) => {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return res.json({ storeName: 'ADORE Jewellery', currency: 'INR' });

    res.json({
      storeName:             settings.storeName,
      storeEmail:            settings.storeEmail,
      storePhone:            settings.storePhone,
      currency:              settings.currency,
      taxRate:               settings.taxRate,
      shippingCost:          settings.shippingCost,
      freeShippingThreshold: settings.freeShippingThreshold,
      appDescription:        settings.appDescription,
    });
  } catch (err) { next(err); }
});

/** GET /api/settings/razorpay-key — Public: Razorpay key_id only (no secret) */
router.get('/razorpay-key', async (req, res, next) => {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings?.razorpayKeyId) {
      return res.status(503).json({ error: 'Razorpay not configured' });
    }
    res.json({ key_id: settings.razorpayKeyId });
  } catch (err) { next(err); }
});

/** GET /api/settings — Admin: full settings (secret masked) */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'default', storeName: 'ADORE Jewellery' },
      });
    }
    res.json({
      ...settings,
      razorpayKeySecret: settings.razorpayKeySecret ? '••••••••' : null,
    });
  } catch (err) { next(err); }
});

/** PUT /api/settings — Admin: update general store settings */
router.put('/', requireAdmin, async (req, res, next) => {
  try {
    const {
      storeName, storeEmail, storePhone, storeAddress,
      currency, taxRate, shippingCost, freeShippingThreshold,
      emailNotifications, orderConfirmationEmail, shippingNotificationEmail,
      appDescription,
    } = req.body;

    const data = {};
    if (storeName !== undefined)                 data.storeName = storeName;
    if (storeEmail !== undefined)                data.storeEmail = storeEmail;
    if (storePhone !== undefined)                data.storePhone = storePhone;
    if (storeAddress !== undefined)              data.storeAddress = storeAddress;
    if (currency !== undefined)                  data.currency = currency;
    if (taxRate !== undefined)                   data.taxRate = parseFloat(taxRate);
    if (shippingCost !== undefined)              data.shippingCost = parseFloat(shippingCost);
    if (freeShippingThreshold !== undefined)     data.freeShippingThreshold = parseFloat(freeShippingThreshold);
    if (emailNotifications !== undefined)        data.emailNotifications = emailNotifications;
    if (orderConfirmationEmail !== undefined)    data.orderConfirmationEmail = orderConfirmationEmail;
    if (shippingNotificationEmail !== undefined) data.shippingNotificationEmail = shippingNotificationEmail;
    if (appDescription !== undefined)            data.appDescription = appDescription;

    let settings = await prisma.settings.findFirst();
    if (settings) {
      settings = await prisma.settings.update({ where: { id: settings.id }, data });
    } else {
      settings = await prisma.settings.create({ data: { id: 'default', ...data } });
    }

    logger.info('Store settings updated');
    res.json({ success: true, settings: { ...settings, razorpayKeySecret: undefined } });
  } catch (err) { next(err); }
});

/** POST /api/settings/razorpay — Admin: save Razorpay credentials */
router.post('/razorpay', requireAdmin, async (req, res, next) => {
  try {
    const { razorpay_key_id, razorpay_key_secret } = req.body;

    if (!razorpay_key_id?.trim())     return res.status(400).json({ error: 'razorpay_key_id is required' });
    if (!razorpay_key_secret?.trim()) return res.status(400).json({ error: 'razorpay_key_secret is required' });

    const data = {
      razorpayKeyId:     razorpay_key_id.trim(),
      razorpayKeySecret: razorpay_key_secret.trim(),
    };

    let settings = await prisma.settings.findFirst();
    if (settings) {
      settings = await prisma.settings.update({ where: { id: settings.id }, data });
    } else {
      settings = await prisma.settings.create({ data: { id: 'default', ...data } });
    }

    logger.info('Razorpay credentials updated');
    res.json({ success: true, message: 'Razorpay credentials saved' });
  } catch (err) { next(err); }
});

export default router;

import express from 'express';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { type, position, active } = req.query;
    const where = {};
    if (type) where.type = type;
    if (position) where.position = position;
    if (active !== undefined) where.active = active === 'true';
    else where.active = true;

    const banners = await prisma.banner.findMany({ where, orderBy: { orderIndex: 'asc' } });
    res.json(banners);
  } catch (err) { next(err); }
});

router.get('/list', async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({ where: { active: true }, orderBy: { orderIndex: 'asc' } });
    res.json(banners);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const banner = await prisma.banner.findUnique({ where: { id: req.params.id } });
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json(banner);
  } catch (err) { next(err); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { title, description, imageUrl, mobileImageUrl, link, type = 'slider', position = 'top', active = true, orderIndex = 0 } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

    const banner = await prisma.banner.create({
      data: { title, description, imageUrl, mobileImageUrl, link, type, position, active, orderIndex },
    });
    logger.info(`Banner created: ${banner.id}`);
    res.status(201).json(banner);
  } catch (err) { next(err); }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { title, description, imageUrl, mobileImageUrl, link, type, position, active, orderIndex } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (mobileImageUrl !== undefined) data.mobileImageUrl = mobileImageUrl;
    if (link !== undefined) data.link = link;
    if (type !== undefined) data.type = type;
    if (position !== undefined) data.position = position;
    if (active !== undefined) data.active = active;
    if (orderIndex !== undefined) data.orderIndex = orderIndex;

    const banner = await prisma.banner.update({ where: { id: req.params.id }, data });
    res.json(banner);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;

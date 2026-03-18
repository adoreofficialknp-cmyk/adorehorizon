import express from 'express';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const VALID_TYPES = ['banner_slider', 'festivals', 'shop_by_color', 'featured_products', 'custom_banner'];

router.get('/', async (req, res, next) => {
  try {
    const includeInactive = req.query.all === 'true';
    const sections = await prisma.homepageSection.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { orderIndex: 'asc' },
    });

    const hydrated = await Promise.all(
      sections.map(async (section) => {
        if (section.type === 'featured_products') {
          const products = await prisma.product.findMany({
            where: { active: true, featured: true },
            include: { category: { select: { name: true, slug: true } } },
            take: section.data?.displayCount || 8,
            orderBy: { createdAt: 'desc' },
          });
          return { ...section, products };
        }
        return section;
      })
    );

    res.json(hydrated);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const section = await prisma.homepageSection.findUnique({ where: { id: req.params.id } });
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch (err) { next(err); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { type, title, data = {}, orderIndex = 0, active = true } = req.body;

    if (!type) return res.status(400).json({ error: 'type is required' });
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
    }

    let finalOrderIndex = orderIndex;
    if (orderIndex === 0) {
      const last = await prisma.homepageSection.findFirst({ orderBy: { orderIndex: 'desc' } });
      finalOrderIndex = last ? last.orderIndex + 1 : 0;
    }

    const section = await prisma.homepageSection.create({
      data: { type, title, data, orderIndex: finalOrderIndex, active },
    });

    logger.info(`Homepage section created: ${section.id} type=${type}`);
    res.status(201).json(section);
  } catch (err) { next(err); }
});

// FIX: /reorder/bulk must be declared BEFORE /:id — otherwise Express matches
// "reorder" as the :id param and the bulk route is never reached.
router.put('/reorder/bulk', requireAdmin, async (req, res, next) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections)) return res.status(400).json({ error: 'sections array required' });

    await Promise.all(
      sections.map(({ id, orderIndex }) =>
        prisma.homepageSection.update({ where: { id }, data: { orderIndex } })
      )
    );

    res.json({ success: true, message: 'Sections reordered' });
  } catch (err) { next(err); }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const existing = await prisma.homepageSection.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Section not found' });

    const { type, title, data, orderIndex, active } = req.body;
    const updateData = {};
    if (type !== undefined) {
      if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: `Invalid type: ${type}` });
      updateData.type = type;
    }
    if (title !== undefined) updateData.title = title;
    if (data !== undefined) updateData.data = data;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;
    if (active !== undefined) updateData.active = active;

    const section = await prisma.homepageSection.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info(`Homepage section updated: ${section.id}`);
    res.json(section);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.homepageSection.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Section deleted' });
  } catch (err) { next(err); }
});

export default router;

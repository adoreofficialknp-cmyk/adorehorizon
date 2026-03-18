import express from 'express';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/* ─── CATEGORIES ─────────────────────────────────────────── */

router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: { orderBy: { name: 'asc' } },
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) { next(err); }
});

router.get('/list', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const category = await prisma.category.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }] },
      include: { subcategories: true },
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) { next(err); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const category = await prisma.category.create({
      data: { name, slug, description, imageUrl },
    });
    logger.info(`Category created: ${category.name}`);
    res.status(201).json(category);
  } catch (err) { next(err); }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;
    const data = {};
    if (name !== undefined) { data.name = name; data.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json(category);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

/* ─── SUBCATEGORIES ──────────────────────────────────────── */

router.get('/:categoryId/subcategories', async (req, res, next) => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId: req.params.categoryId },
      orderBy: { name: 'asc' },
    });
    res.json(subcategories);
  } catch (err) { next(err); }
});

router.post('/:categoryId/subcategories', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const slug = `${req.params.categoryId}-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

    const sub = await prisma.subcategory.create({
      data: { name, slug, description, imageUrl, categoryId: req.params.categoryId },
    });
    res.status(201).json(sub);
  } catch (err) { next(err); }
});

router.get('/subcategories/:id', async (req, res, next) => {
  try {
    const sub = await prisma.subcategory.findUnique({
      where: { id: req.params.id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!sub) return res.status(404).json({ error: 'Subcategory not found' });
    res.json(sub);
  } catch (err) { next(err); }
});

router.put('/subcategories/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const sub = await prisma.subcategory.update({ where: { id: req.params.id }, data });
    res.json(sub);
  } catch (err) { next(err); }
});

router.delete('/subcategories/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.subcategory.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;

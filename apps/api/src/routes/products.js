import express from 'express';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/products — List with filtering, search, pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, category, subcategory,
      featured, color, search, sort = 'createdAt', order = 'desc',
    } = req.query;

    // Safe parse: fall back to defaults if non-numeric strings are passed (e.g. limit=abc → NaN → 20)
    const safePage  = Math.max(parseInt(page)  || 1,  1);
    const safeLimit = Math.min(parseInt(limit) || 20, 100);

    const where = { active: true };

    if (category) {
      const cat = await prisma.category.findFirst({
        where: { OR: [{ id: category }, { slug: category }] },
      });
      if (cat) where.categoryId = cat.id;
    }
    if (subcategory) {
      const sub = await prisma.subcategory.findFirst({
        where: { OR: [{ id: subcategory }, { slug: subcategory }] },
      });
      if (sub) where.subcategoryId = sub.id;
    }
    if (featured === 'true') where.featured = true;
    if (color) where.color = { contains: color, mode: 'insensitive' };
    if (search) {
      // Note: tags uses {has} for exact match (Postgres array contains).
      // For partial tag search you would need a raw query or a different schema.
      where.OR = [
        { name:        { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags:        { has: search } },
      ];
    }

    const sortField = ['price', 'createdAt', 'rating', 'name'].includes(sort) ? sort : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        include: {
          category:    { select: { id: true, name: true, slug: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      items,
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
    });
  } catch (err) { next(err); }
});

/** GET /api/products/list (legacy alias) */
router.get('/list', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        category:    { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(products);
  } catch (err) { next(err); }
});

/** GET /api/products/featured */
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const products = await prisma.product.findMany({
      where: { active: true, featured: true },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json(products);
  } catch (err) { next(err); }
});

/** GET /api/products/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }], active: true },
      include: {
        category:    { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
});

/** POST /api/products — Create (admin) */
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const {
      name, description, price, comparePrice, images = [],
      categoryId, subcategoryId, color, stock = 0,
      featured = false, active = true, weight, sku, tags = [],
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const product = await prisma.product.create({
      data: {
        name, slug, description,
        price:        parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images,
        categoryId:    categoryId    || null,
        subcategoryId: subcategoryId || null,
        color,
        stock:   parseInt(stock) || 0,
        featured,
        active,
        weight: weight ? parseFloat(weight) : null,
        sku:    sku    || null,
        tags,
      },
      include: { category: true, subcategory: true },
    });

    logger.info(`Product created: ${product.id} - ${product.name}`);
    res.status(201).json(product);
  } catch (err) { next(err); }
});

/** PUT /api/products/:id — Update (admin) */
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const {
      name, description, price, comparePrice, images,
      categoryId, subcategoryId, color, stock, featured,
      active, weight, sku, tags,
    } = req.body;

    const data = {};
    if (name !== undefined)          { data.name = name; data.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
    if (description !== undefined)   data.description   = description;
    if (price !== undefined)         data.price         = parseFloat(price);
    if (comparePrice !== undefined)  data.comparePrice  = comparePrice ? parseFloat(comparePrice) : null;
    if (images !== undefined)        data.images        = images;
    if (categoryId !== undefined)    data.categoryId    = categoryId    || null;
    if (subcategoryId !== undefined) data.subcategoryId = subcategoryId || null;
    if (color !== undefined)         data.color         = color;
    if (stock !== undefined)         data.stock         = parseInt(stock) || 0;
    if (featured !== undefined)      data.featured      = featured;
    if (active !== undefined)        data.active        = active;
    if (weight !== undefined)        data.weight        = weight ? parseFloat(weight) : null;
    if (sku !== undefined)           data.sku           = sku || null;
    if (tags !== undefined)          data.tags          = tags;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { category: true, subcategory: true },
    });

    logger.info(`Product updated: ${product.id}`);
    res.json(product);
  } catch (err) { next(err); }
});

/** DELETE /api/products/:id — Soft-delete (admin) */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
});

export default router;

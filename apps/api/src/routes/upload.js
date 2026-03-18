import express from 'express';
import multer from 'multer';
import prisma from '../utils/prisma.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { requireAdmin, authenticate } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

/** POST /api/upload — Universal upload (images & videos) → Cloudinary */
router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const folder = req.query.folder || req.body.folder || 'adore-jewellery/general';
    const isVideo = req.file.mimetype.startsWith('video/');

    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      resourceType: isVideo ? 'video' : 'image',
    });

    const media = await prisma.media.create({
      data: {
        url: result.url,
        publicId: result.publicId,
        type: isVideo ? 'video' : 'image',
        filename: req.file.originalname,
        size: result.bytes,
        width: result.width || null,
        height: result.height || null,
        folder,
      },
    });

    logger.info(`File uploaded to Cloudinary: ${result.publicId}`);
    res.json({ success: true, url: result.url, publicId: result.publicId, mediaId: media.id });
  } catch (err) { next(err); }
});

/** POST /api/upload/product-image */
router.post('/product-image', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const result = await uploadToCloudinary(req.file.buffer, { folder: 'adore-jewellery/products' });

    await prisma.media.create({
      data: {
        url: result.url, publicId: result.publicId, type: 'image',
        filename: req.file.originalname, size: result.bytes,
        width: result.width, height: result.height,
        folder: 'adore-jewellery/products',
      },
    });

    logger.info(`Product image uploaded: ${result.publicId}`);
    res.json({ success: true, url: result.url, publicId: result.publicId });
  } catch (err) { next(err); }
});

/** POST /api/upload/banner-image */
router.post('/banner-image', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const result = await uploadToCloudinary(req.file.buffer, { folder: 'adore-jewellery/banners' });

    await prisma.media.create({
      data: {
        url: result.url, publicId: result.publicId, type: 'image',
        filename: req.file.originalname, size: result.bytes,
        folder: 'adore-jewellery/banners',
      },
    });

    res.json({ success: true, url: result.url, publicId: result.publicId });
  } catch (err) { next(err); }
});

/** POST /api/upload/section-media */
router.post('/section-media', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const isVideo = req.file.mimetype.startsWith('video/');
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'adore-jewellery/homepage',
      resourceType: isVideo ? 'video' : 'image',
    });

    await prisma.media.create({
      data: {
        url: result.url, publicId: result.publicId,
        type: isVideo ? 'video' : 'image',
        filename: req.file.originalname, size: result.bytes,
        folder: 'adore-jewellery/homepage',
      },
    });

    res.json({ success: true, url: result.url, publicId: result.publicId, type: isVideo ? 'video' : 'image' });
  } catch (err) { next(err); }
});

// FIX: Static sub-paths (/media-library) must come BEFORE dynamic (/media/:id)
// to prevent Express matching "media-library" as the :id param.

/** GET /api/upload/media-library — Admin: paginated media list */
router.get('/media-library', requireAdmin, async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const type  = req.query.type; // 'image' | 'video'

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where: type ? { type } : {},
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.media.count({ where: type ? { type } : {} }),
    ]);

    res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

/** DELETE /api/upload/media/:id — Admin: delete from Cloudinary + DB */
router.delete('/media/:id', requireAdmin, async (req, res, next) => {
  try {
    const media = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!media) return res.status(404).json({ error: 'Media not found' });

    await deleteFromCloudinary(media.publicId, media.type === 'video' ? 'video' : 'image');
    await prisma.media.delete({ where: { id: media.id } });

    res.json({ success: true, message: 'Media deleted' });
  } catch (err) { next(err); }
});

export default router;

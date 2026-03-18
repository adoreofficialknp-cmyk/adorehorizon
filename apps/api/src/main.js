import 'dotenv/config';        // must be first — loads .env before anything else reads env vars
import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import morgan  from 'morgan';

// ── Env validation — fail fast with a clear message ───────────────────────
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length && process.env.NODE_ENV === 'production') {
  console.error(`[Startup] ❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('[Startup] Add them in Render → Your Service → Environment tab.');
  process.exit(1);
}

// Cloudinary — warn but don't crash (uploads will fail per-request with a clear error)
const CLD_VARS = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingCld = CLD_VARS.filter(k => !process.env[k] && !process.env[k.replace('CLOUDINARY_CLOUD_NAME','CLOUDINARY_NAME').replace('CLOUDINARY_API_KEY','CLOUDINARY_KEY').replace('CLOUDINARY_API_SECRET','CLOUDINARY_SECRET')]);
if (missingCld.length) {
  console.warn(`[Startup] ⚠️  Cloudinary vars not set: ${CLD_VARS.join(', ')}  — image uploads will fail.`);
}

// ── Route imports ──────────────────────────────────────────────────────────
import authRouter          from './routes/auth.js';
import uploadRouter        from './routes/upload.js';
import productsRouter      from './routes/products.js';
import categoriesRouter    from './routes/categories.js';
import bannersRouter       from './routes/banners.js';
import homepageRouter      from './routes/homepage.js';
import settingsRouter      from './routes/settings.js';
import paymentRouter       from './routes/payment.js';
import checkoutRouter      from './routes/checkout.js';
import couponsRouter       from './routes/coupons.js';
import applyCouponRouter   from './routes/apply-coupon.js';
import cartRouter          from './routes/cart.js';
import hooksRouter         from './routes/hooks.js';
import ordersRouter        from './routes/orders.js';
import razorpayTestRouter  from './routes/razorpay-test.js';
import verifyPaymentRouter from './routes/verify-payment.js';
import reviewsRouter       from './routes/reviews.js';
import healthCheck         from './routes/health-check.js';
import { errorMiddleware } from './middleware/error.js';

const app = express();

// ── Process-level crash guards ─────────────────────────────────────────────
process.on('uncaughtException',  (err)    => console.error('[Process] Uncaught exception:',  err));
process.on('unhandledRejection', (reason) => console.error('[Process] Unhandled rejection:', reason));

process.on('SIGINT',  () => { console.log('[Process] SIGINT — exiting'); process.exit(0); });
process.on('SIGTERM', async () => {
  console.log('[Process] SIGTERM — draining connections...');
  await new Promise(r => setTimeout(r, 3000));
  const { default: prisma } = await import('./utils/prisma.js');
  await prisma.$disconnect().catch(() => {});
  process.exit(0);
});

// ── Root route — satisfies Render's "GET /" requirement ───────────────────
app.get('/', (_req, res) => res.json({
  status:  'ok',
  service: 'ADORE Jewellery API',
  version: '1.0.0',
  docs:    '/api/health',
}));

// ── Health checks — MUST be before HTTPS redirect ─────────────────────────
// Render's load-balancer sends HTTP health probes — they must never be redirected.
app.get('/health',     healthCheck);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── HTTPS redirect (Render sets x-forwarded-proto) ─────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// ── Security & logging ────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc:    ["'self'", 'https:'],
      connectSrc: ["'self'", 'https:'],
      mediaSrc:   ["'self'", 'https:'],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── API routes ────────────────────────────────────────────────────────────
app.use('/api/auth',           authRouter);
app.use('/api/upload',         uploadRouter);
app.use('/api/products',       productsRouter);
app.use('/api/categories',     categoriesRouter);
app.use('/api/banners',        bannersRouter);
app.use('/api/homepage',       homepageRouter);
app.use('/api/settings',       settingsRouter);
app.use('/api/payment',        paymentRouter);
app.use('/api/checkout',       checkoutRouter);
app.use('/api/coupons',        couponsRouter);
app.use('/api/apply-coupon',   applyCouponRouter);
app.use('/api/cart',           cartRouter);
app.use('/api/hooks',          hooksRouter);
app.use('/api/orders',         ordersRouter);
app.use('/api/razorpay-test',  razorpayTestRouter);
app.use('/api/verify-payment', verifyPaymentRouter);
app.use('/api/reviews',        reviewsRouter);

// ── Error handling (must be last) ─────────────────────────────────────────
app.use(errorMiddleware);
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Start server ──────────────────────────────────────────────────────────
const port = parseInt(process.env.PORT) || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`[Server] 🚀 API running on port ${port}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Server] Database:    ${process.env.DATABASE_URL ? '✅ URL set' : '❌ NOT SET'}`);
  console.log(`[Server] Cloudinary:  ${process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME ? '✅ configured' : '⚠️  not configured'}`);
});

export default app;

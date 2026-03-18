import { PrismaClient } from '@prisma/client';

// ── Validate DATABASE_URL immediately ──────────────────────────────────────
if (!process.env.DATABASE_URL) {
  console.error('[Prisma] ❌ DATABASE_URL environment variable is not set.');
  if (process.env.NODE_ENV === 'production') {
    console.error('[Prisma] ❌ Cannot start without DATABASE_URL in production. Exiting.');
    process.exit(1);
  }
}

// ── Create Prisma client ───────────────────────────────────────────────────
const prisma = new PrismaClient({
  datasources: {
    db: {
      // Explicit override ensures Render/Neon/Supabase URL is always used,
      // even if .env file is stale or not present in production.
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
});

// ── Test connection on startup ─────────────────────────────────────────────
// This runs once when the module is first imported (i.e. when the server starts).
// If the DB is unreachable, the error is logged clearly instead of failing silently.
prisma.$connect()
  .then(() => console.log('[Prisma] ✅ Database connected successfully'))
  .catch((err) => {
    console.error('[Prisma] ❌ Database connection failed:', err.message);
    console.error('[Prisma] Check: DATABASE_URL is correct, DB is running, SSL/TLS is configured.');
    // Don't exit — Render may restart the service. Let individual requests fail
    // with a clear error rather than killing the whole process on a transient blip.
  });

export default prisma;

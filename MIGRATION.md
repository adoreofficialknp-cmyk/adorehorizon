# Migration Guide — PocketBase → PostgreSQL + Cloudinary + JWT

## What Was Changed

### Backend (`apps/api/`)

#### REMOVED
- `src/utils/pocketbase.js` — PocketBase SDK client deleted
- `pocketbase` npm dependency removed
- `stripe` npm dependency removed (unused)

#### ADDED
- `prisma/schema.prisma` — Full PostgreSQL schema with all models
- `prisma/seed.js` — Seed script for admin user + categories + defaults
- `src/utils/prisma.js` — Prisma client singleton
- `src/utils/cloudinary.js` — Cloudinary upload/delete helpers
- `src/middleware/auth.js` — JWT middleware (authenticate, requireAdmin, optionalAuth)

#### REWRITTEN (PocketBase → Prisma/JWT)
| File | What Changed |
|------|-------------|
| `src/routes/auth.js` | Replaced PocketBase auth with bcrypt + JWT. Added `/register`, `/login`, `/admin-login`, `/me` endpoints |
| `src/routes/upload.js` | Replaced PocketBase file storage with Cloudinary. Added `/media-library` and DELETE endpoint |
| `src/routes/products.js` | Full CRUD with Prisma, with filtering/search/pagination |
| `src/routes/categories.js` | Full CRUD with Prisma, includes subcategory routes |
| `src/routes/banners.js` | Full CRUD with Prisma |
| `src/routes/settings.js` | Razorpay keys + store settings stored in PostgreSQL |
| `src/routes/payment.js` | Razorpay keys fetched dynamically from DB (no hardcoded env) |
| `src/routes/checkout.js` | Order creation with Prisma. Added `/orders/*` endpoints |
| `src/routes/coupons.js` | Full CRUD + `/apply` endpoint |
| `src/main.js` | Added `/api/homepage` route, removed PocketBase proxy routes |

#### NEW ROUTES
- `src/routes/homepage.js` — Full CRUD for dynamic homepage sections with bulk reorder

---

### Frontend (`apps/web/`)

#### REMOVED
- `src/lib/pocketbaseClient.js` — Replaced by compatibility shim (see below)
- `pocketbase` npm dependency removed from `package.json`
- All Horizons/PocketBase dev plugins removed from `vite.config.js`

#### ADDED
- `src/lib/api.js` — Clean JWT-based API client (use this for all new code)
- `src/lib/pocketbaseClient.js` — Compatibility shim (redirects old PocketBase calls to `/api/*`)
- `src/lib/apiServerClient.js` — Shim for legacy `apiServerClient.fetch()` calls

#### REWRITTEN
| File | What Changed |
|------|-------------|
| `src/contexts/AuthContext.jsx` | JWT-based auth, no PocketBase. `login()` calls `/api/auth/login` |
| `src/contexts/AdminAuthContext.jsx` | Delegates to AuthContext, no PocketBase |
| `src/pages/LoginPage.jsx` | Email/phone + password form, calls `AuthContext.login()` |
| `src/pages/SignupPage.jsx` | Full signup form with validation |
| `src/pages/admin/AdminLoginPage.jsx` | Dedicated admin login form |
| `src/pages/admin/AdminHomepageBuilder.jsx` | Uses `api.js`, full section management UI |
| `src/pages/admin/SettingsPage.jsx` | Uses `api.js`, Razorpay keys stored in DB |
| `src/pages/admin/MediaLibrary.jsx` | Cloudinary-based media library |
| `src/pages/CheckoutPage.jsx` | Full Razorpay integration, coupon support |
| `src/components/admin/SectionEditorModal.jsx` | Cloudinary uploads, all 5 section types |
| `vite.config.js` | Removed PocketBase plugin, added API proxy |
| `package.json` | Removed pocketbase, react-razorpay, stripe dependencies |

---

## Remaining Migration Work

Many pages still import from `@/lib/pocketbaseClient` or `@/lib/apiServerClient`.
They will continue to work via the compatibility shims, but for a clean codebase,
migrate them page by page to use `import api from '@/lib/api.js'`.

### Pages to migrate (prioritised):
1. `src/pages/admin/ProductFormPage.jsx` — Upload images via `/api/upload/product-image`
2. `src/pages/admin/ProductListPage.jsx` — Use `api.get('/products')`
3. `src/pages/admin/BannerFormPage.jsx` — Upload via `/api/upload/banner-image`
4. `src/pages/admin/CategoryFormPage.jsx` — Use `api.post('/categories')`
5. `src/pages/admin/AdminDashboard.jsx` — Use `api.get('/orders')`, `/products`, etc.
6. `src/pages/CartPage.jsx` — Local cart state (no API needed)
7. `src/pages/ShopPage.jsx` — Use `api.get('/products')`
8. `src/pages/ProductDetailPage.jsx` — Use `api.get('/products/:id')`
9. `src/pages/OrderTrackingPage.jsx` — Use `api.get('/orders/:orderId')`

### Migration pattern:
```js
// OLD
import pb from '@/lib/pocketbaseClient';
const products = await pb.collection('products').getList(1, 50);

// NEW
import api from '@/lib/api.js';
const { items: products } = await api.get('/products?limit=50');
```

---

## Environment Variables Summary

### Backend (`apps/api/.env`)
```
DATABASE_URL=postgresql://...
CLOUDINARY_NAME=...
CLOUDINARY_KEY=...
CLOUDINARY_SECRET=...
JWT_SECRET=...
RAZORPAY_KEY_ID=...     (optional)
RAZORPAY_KEY_SECRET=... (optional)
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.com
PORT=3001
```

### Frontend (`apps/web/.env`)
```
VITE_API_URL=https://your-api.onrender.com/api
```

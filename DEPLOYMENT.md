# 🚀 Deployment Guide — ADORE Jewellery (PostgreSQL + Cloudinary + Render)

## Quick Reference
- **Admin Email:** `admin@adorejewellery.com` / **Password:** `Admin@12345`
- **Admin Phone:** `7897671348` / **Password:** `Admin@12345`
- **Admin URL:** `/admin-portal-secure-access/login`

---

## Step 1 — Create PostgreSQL on Render

1. Go to **Render Dashboard → New → PostgreSQL**
2. Name: `adore-jewellery-db`
3. Plan: **Free** (or Starter for production)
4. Region: Choose closest to your users
5. Click **Create Database**
6. Once created, click the database → copy the **External Database URL**
   - Looks like: `postgresql://user:pass@host.render.com:5432/dbname`
   - This becomes your `DATABASE_URL` env var

> ⚠️ Free Render PostgreSQL databases pause after 90 days of inactivity and are deleted after 1 month. Use Starter plan for production.

---

## Step 2 — Setup Cloudinary

1. Create account at [cloudinary.com](https://cloudinary.com) (free tier is fine)
2. Go to **Dashboard** → copy:
   - **Cloud Name** → `CLOUDINARY_NAME`
   - **API Key** → `CLOUDINARY_KEY`
   - **API Secret** → `CLOUDINARY_SECRET`
3. In **Settings → Upload presets**, make sure uploads are allowed (default is fine)
4. In **Settings → Security**, note your allowed origins if you restrict them

---

## Step 3 — Deploy Backend API to Render

1. Push your code to GitHub
2. In Render: **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `adore-api`
   - **Root Directory:** `apps/api`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npx prisma db push`
   - **Start Command:** `node src/main.js`
   - **Node Version:** 22 (or 20)

5. Add **Environment Variables** (click "Add Environment Variable" for each):

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Required |
| `DATABASE_URL` | `postgresql://...` | From Step 1 |
| `JWT_SECRET` | *(random 64-char string)* | **Required** — see below |
| `CLOUDINARY_NAME` | your cloud name | From Step 2 |
| `CLOUDINARY_KEY` | your api key | From Step 2 |
| `CLOUDINARY_SECRET` | your api secret | From Step 2 |
| `CORS_ORIGIN` | `https://your-frontend.onrender.com` | From Step 4 |
| `PORT` | `3001` | Optional — Render sets this |
| `RAZORPAY_KEY_ID` | `rzp_live_xxx` | Optional — can set in Admin panel |
| `RAZORPAY_KEY_SECRET` | your secret | Optional — can set in Admin panel |
| `RAZORPAY_WEBHOOK_SECRET` | your webhook secret | Optional |

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

6. Click **Create Web Service**
7. Wait for first deploy to complete (~2-3 minutes)
8. Copy your API URL: `https://adore-api.onrender.com`

---

## Step 4 — Seed the Database

After the API deploys successfully:

1. In Render, go to your Web Service → **Shell** tab
2. Run:
```bash
node prisma/seed.js
```

This creates:
- ✅ Admin: `admin@adorejewellery.com` / `Admin@12345`
- ✅ Admin (phone): `7897671348` / `Admin@12345`
- ✅ Categories: Gold, Silver, Platinum, Diamond (with 8 subcategories each)
- ✅ Default homepage sections
- ✅ Default store settings

**⚠️ Change the admin password immediately after first login!**

---

## Step 5 — Deploy Frontend to Render

1. In Render: **New → Static Site**
2. Connect the same GitHub repository
3. Configure:
   - **Name:** `adore-web`
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Add **Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://adore-api.onrender.com/api` |
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` (optional) |

5. Add a **Redirect/Rewrite Rule** (CRITICAL for React Router):
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite** (not redirect)

6. Click **Create Static Site**

> ⚠️ Without the rewrite rule, refreshing any page other than `/` will show a 404.

---

## Step 6 — Update CORS on Backend

After frontend deploys, you'll know its URL (e.g. `https://adore-web.onrender.com`):

1. Go to your API Web Service → **Environment**
2. Update `CORS_ORIGIN` to `https://adore-web.onrender.com`
3. Click **Save Changes** — Render will auto-redeploy

---

## Step 7 — First Login & Configuration

1. Visit `https://adore-web.onrender.com/admin-portal-secure-access/login`
2. Login: `admin@adorejewellery.com` / `Admin@12345`
3. Go to **Settings**:
   - Update store name, email, phone, address
   - Enter Razorpay credentials (Key ID + Key Secret) under Razorpay tab
4. Go to **Homepage Builder** → configure banner sections
5. Go to **Products** → add products with images
6. Go to **Banners** → upload hero banner images

---

## Local Development

```bash
# 1. Clone and install
git clone <your-repo>
npm run install:all   # installs root + apps/api + apps/web deps

# 2. Setup API env
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env:
#   DATABASE_URL=postgresql://...
#   JWT_SECRET=any-random-string-for-dev
#   CLOUDINARY_NAME=...
#   CLOUDINARY_KEY=...
#   CLOUDINARY_SECRET=...

# 3. Setup frontend env
cp apps/web/.env.example apps/web/.env
# VITE_API_URL=http://localhost:3001/api

# 4. Push DB schema (first time only)
cd apps/api && npm run db:push

# 5. Seed database
npm run db:seed

# 6. Run both servers
cd ../..
npm run dev
# API:      http://localhost:3001
# Frontend: http://localhost:3000
```

---

## Complete API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register user |
| POST | `/api/auth/login` | None | Login (email or phone) |
| POST | `/api/auth/admin-login` | None | Admin login |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/me` | JWT | Update profile |
| POST | `/api/auth/logout` | None | Logout |
| GET | `/api/auth/users` | Admin | List all users |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | None | List with filters/pagination |
| GET | `/api/products/featured` | None | Featured products |
| GET | `/api/products/list` | None | All active products |
| GET | `/api/products/:id` | None | Single product + reviews |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft-delete product |

### Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews` | Admin | List all reviews |
| POST | `/api/reviews` | JWT | Submit review |
| PUT | `/api/reviews/:id` | Admin | Approve/reject review |
| DELETE | `/api/reviews/:id` | Admin | Delete review |

### Categories
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | None | All categories + subcategories |
| GET | `/api/categories/:id` | None | Single category |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |
| GET | `/api/categories/:id/subcategories` | None | List subcategories |
| POST | `/api/categories/:id/subcategories` | Admin | Create subcategory |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/checkout/create-order` | Optional | Create order |
| GET | `/api/orders` | Admin | All orders |
| GET | `/api/orders/my` | JWT | My orders |
| GET | `/api/orders/:id` | Optional | Single order |
| PUT | `/api/orders/:id/status` | Admin | Update order/payment status |
| DELETE | `/api/orders/:id` | Admin | Cancel order |

### Payment (Razorpay)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payment/razorpay-order` | Optional | Create Razorpay order |
| POST | `/api/payment/verify-razorpay` | Optional | Verify payment |
| POST | `/api/verify-payment` | None | Verify payment (alias) |
| POST | `/api/hooks/razorpay` | None | Webhook |

### Banners
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/banners` | None | Active banners |
| GET | `/api/banners/:id` | None | Single banner |
| POST | `/api/banners` | Admin | Create banner |
| PUT | `/api/banners/:id` | Admin | Update banner |
| DELETE | `/api/banners/:id` | Admin | Delete banner |

### Homepage Sections
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/homepage` | None | Active sections |
| GET | `/api/homepage?all=true` | None | All sections |
| POST | `/api/homepage` | Admin | Create section |
| PUT | `/api/homepage/reorder/bulk` | Admin | Reorder sections |
| PUT | `/api/homepage/:id` | Admin | Update section |
| DELETE | `/api/homepage/:id` | Admin | Delete section |

### Uploads (Cloudinary)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | JWT | Upload any file |
| POST | `/api/upload/product-image` | JWT | Upload product image |
| POST | `/api/upload/banner-image` | JWT | Upload banner image |
| POST | `/api/upload/section-media` | JWT | Upload section media |
| GET | `/api/upload/media-library` | Admin | List all media |
| DELETE | `/api/upload/media/:id` | Admin | Delete media |

### Coupons
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/coupons` | Admin | List coupons |
| POST | `/api/coupons` | Admin | Create coupon |
| PUT | `/api/coupons/:id` | Admin | Update coupon |
| DELETE | `/api/coupons/:id` | Admin | Delete coupon |
| POST | `/api/coupons/apply` | Optional | Apply coupon |
| POST | `/api/apply-coupon` | None | Apply coupon (alias) |

### Settings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/settings` | Admin | Full settings |
| GET | `/api/settings/public` | None | Public settings |
| GET | `/api/settings/razorpay-key` | None | Razorpay public key |
| PUT | `/api/settings` | Admin | Update settings |
| POST | `/api/settings/razorpay` | Admin | Save Razorpay keys |

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | DB + server health check |
| GET | `/api/health` | None | API health check |

---

## Troubleshooting

### ❌ "Cannot find module" / build fails
→ Run `npm install` inside `apps/api` or `apps/web` separately

### ❌ "JWT_SECRET environment variable is not set"
→ Add `JWT_SECRET` env var in Render → Environment tab

### ❌ Database connection error
→ Check `DATABASE_URL` matches your Render PostgreSQL External URL exactly
→ Ensure the DB is not paused (free tier pauses after inactivity)

### ❌ Images not uploading / Cloudinary errors
→ Verify `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` are correct
→ Check Cloudinary dashboard for any usage limits

### ❌ CORS errors in browser
→ Set `CORS_ORIGIN=https://your-frontend-domain.onrender.com` on the API service
→ Redeploy after updating the env var

### ❌ Frontend shows 404 on page refresh
→ Add the Rewrite Rule in Render Static Site: `/* → /index.html`

### ❌ Razorpay payment not working
→ Check if test/live key matches the environment (test keys start with `rzp_test_`)
→ Enter keys via Admin → Settings → Razorpay tab
→ Ensure webhook secret matches what's set in Razorpay dashboard

### ❌ Admin login fails
→ Run seed: `node prisma/seed.js` in the API shell
→ Default: `admin@adorejewellery.com` / `Admin@12345`

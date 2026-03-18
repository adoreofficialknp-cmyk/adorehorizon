import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin by phone ────────────────────────────────────────────
  const phoneAdminHash = await bcrypt.hash('Admin@12345', 12);
  const phoneAdmin = await prisma.user.upsert({
    where:  { phone: '7897671348' },
    update: { role: 'admin', password: phoneAdminHash, name: 'Admin', verified: true },
    create: { phone: '7897671348', name: 'Admin', password: phoneAdminHash, role: 'admin', verified: true },
  });
  console.log('✅ Phone admin seeded:', phoneAdmin.phone, '→ password: Admin@12345');

  // ── Admin by email ────────────────────────────────────────────
  const emailAdminHash = await bcrypt.hash('Admin@12345', 12);
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@adorejewellery.com' },
    update: {},
    create: {
      name: 'Admin Email', email: 'admin@adorejewellery.com',
      password: emailAdminHash, role: 'admin', verified: true,
    },
  });
  console.log('✅ Email admin seeded:', admin.email, '→ password: Admin@12345');

  // ── Categories + subcategories ────────────────────────────────
  const categories = [
    { name: 'Gold',     slug: 'gold',     description: 'Pure gold jewellery collection' },
    { name: 'Silver',   slug: 'silver',   description: 'Sterling silver jewellery collection' },
    { name: 'Platinum', slug: 'platinum', description: 'Premium platinum jewellery collection' },
    { name: 'Diamond',  slug: 'diamond',  description: 'Exquisite diamond jewellery collection' },
  ];

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: cat,
    });

    const subcategoryNames = ['Rings', 'Chains', 'Mangalsutra', 'Earrings', 'Bangles', 'Bracelets', 'Pendants', 'Necklaces'];
    for (const subName of subcategoryNames) {
      const slug = `${cat.slug}-${subName.toLowerCase()}`;
      await prisma.subcategory.upsert({
        where:  { slug_categoryId: { slug, categoryId: category.id } },
        update: {},
        create: { name: subName, slug, categoryId: category.id },
      });
    }
    console.log(`✅ Category seeded: ${cat.name} with ${subcategoryNames.length} subcategories`);
  }

  // ── Default settings ──────────────────────────────────────────
  await prisma.settings.upsert({
    where:  { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'ADORE Jewellery',
      storeEmail: 'admin@adorejewellery.com',
      currency: 'INR',
      shippingCost: 0,
      freeShippingThreshold: 999,
    },
  });
  console.log('✅ Default settings created');

  // ── Homepage sections — idempotent: only create if none exist ─
  // Using create() without a guard caused duplicate sections on every seed run.
  const existingSections = await prisma.homepageSection.count();
  if (existingSections === 0) {
    const sections = [
      {
        type: 'banner_slider', title: 'Hero Slider', orderIndex: 0,
        data: { banners: [] },
      },
      {
        type: 'featured_products', title: 'Featured Collection', orderIndex: 1,
        data: { subtitle: 'Handpicked for you', displayCount: 8 },
      },
      {
        type: 'festivals', title: 'Festival Collections', orderIndex: 2,
        data: {
          items: [
            { title: 'Diwali Collection',  image: '', link: '/shop?festival=diwali' },
            { title: 'Wedding Season',     image: '', link: '/shop?festival=wedding' },
            { title: 'Akshaya Tritiya',    image: '', link: '/shop?festival=akshaya-tritiya' },
          ],
        },
      },
      {
        type: 'shop_by_color', title: 'Shop by Metal', orderIndex: 3,
        data: {
          items: [
            { name: 'Gold',         colorCode: '#FFD700', image: '', link: '/shop?category=gold' },
            { name: 'Rose Gold',    colorCode: '#B76E79', image: '', link: '/shop?color=rose-gold' },
            { name: 'Silver',       colorCode: '#C0C0C0', image: '', link: '/shop?category=silver' },
            { name: 'Diamond White', colorCode: '#FFFFFF', image: '', link: '/shop?category=diamond' },
          ],
        },
      },
    ];

    await prisma.homepageSection.createMany({ data: sections });
    console.log('✅ Default homepage sections created');
  } else {
    console.log(`⏭️  Homepage sections already exist (${existingSections}), skipping`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log('─────────────────────────────────────────');
  console.log('Admin (phone):  7897671348  / Admin@12345');
  console.log('Admin (email):  admin@adorejewellery.com / Admin@12345');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

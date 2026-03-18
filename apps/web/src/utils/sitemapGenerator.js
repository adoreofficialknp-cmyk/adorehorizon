import api from '@/lib/api.js';

/**
 * Generates a valid XML sitemap string with static and dynamic routes.
 */
export const generateSitemapXml = async () => {
  const siteUrl = 'https://adorejewellery.com';
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const addUrl = (loc, priority, changefreq, lastmod = new Date().toISOString().split('T')[0]) => {
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}${loc}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  };

  // Static pages
  addUrl('/', '1.0', 'weekly');
  addUrl('/shop', '0.9', 'daily');
  addUrl('/help', '0.5', 'monthly');
  addUrl('/ring-sizer', '0.6', 'monthly');

  try {
    const products = await api.get('/products?limit=500').then(d => Array.isArray(d) ? d : d.items || []).catch(() => []);
    products.forEach(p => {
      const lastmod = p.updatedAt ? p.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0];
      addUrl(`/product/${p.id}`, '0.8', 'weekly', lastmod);
    });

    const categories = await api.get('/categories').then(d => Array.isArray(d) ? d : d.items || []).catch(() => []);
    categories.forEach(c => {
      addUrl(`/shop?category=${encodeURIComponent(c.slug || c.name)}`, '0.6', 'weekly');
    });
  } catch (e) {
    console.error('Failed to fetch dynamic routes for sitemap', e);
  }

  xml += `</urlset>`;
  return xml;
};

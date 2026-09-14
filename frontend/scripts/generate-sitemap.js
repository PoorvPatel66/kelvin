import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const siteUrl = process.env.VITE_SITE_URL || 'https://kelvinecoproducts.com';
const productSlugs = [
  'paper-cups',
  'paper-containers',
  'pizza-boxes',
  'salad-bowls',
  'meal-boxes',
  'tea-flasks',
  'plastic-lids',
  'custom-printing'
];
const staticRoutes = ['/', '/contact', '/request-quote'];

function urlEntry(path, priority, changefreq = 'weekly') {
  return `  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const entries = [
  ...staticRoutes.map((route) => urlEntry(route, route === '/' ? '1.0' : '0.9')),
  ...productSlugs.map((slug) => urlEntry(`/products/${slug}`, '0.8'))
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

writeFileSync(resolve('public/sitemap.xml'), sitemap);
console.log(`Generated sitemap.xml with ${entries.length} URLs.`);

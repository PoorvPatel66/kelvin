# Enterprise SEO System

## Static Head

`index.html` contains the crawler-safe defaults:

- `title`
- `description`
- `robots`
- OpenGraph defaults
- Twitter Card defaults
- canonical URL
- theme color
- favicon
- Cloudinary preconnect and DNS prefetch

These defaults are visible before React loads.

## Dynamic Metadata

`components/seo/SEO.jsx` updates route-level metadata after React navigation:

- document title
- meta description
- robots directive
- canonical URL
- OpenGraph title, description, URL, image, and type
- Twitter Card title, description, and image
- Google Search Console verification
- JSON-LD schema scripts

Admin pages use `noindex,nofollow`.

## Schema.org

`seo/schema.js` generates structured data:

- `Organization`
- `WebSite`
- `BreadcrumbList`
- `Product`
- `BlogPosting`

Product detail pages render Product schema. Blog detail pages render BlogPosting schema. Public detail pages also render BreadcrumbList schema.

## Breadcrumbs

`components/seo/Breadcrumbs.jsx` renders accessible visual breadcrumbs.

The same breadcrumb item array is passed to `breadcrumbSchema()` so users and crawlers receive consistent navigation structure.

## Canonical URLs

`seo/seoConfig.js` centralizes `VITE_SITE_URL`.

Every dynamic page passes `canonicalPath` into `SEO`, which converts it into a full canonical URL.

## robots.txt

`public/robots.txt` allows public pages and blocks `/admin/`.

It also points crawlers to:

```txt
https://kelvinecoproducts.com/sitemap.xml
```

## sitemap.xml

`public/sitemap.xml` ships with the main public routes and product routes.

Regenerate it with:

```bash
npm run seo:sitemap
```

For a fully dynamic production sitemap, replace `scripts/generate-sitemap.js` product/blog arrays with backend API fetches during CI.

## Google Search Console

Set this in Vercel:

```env
VITE_GSC_VERIFICATION=your-google-token
```

The SEO component injects:

```html
<meta name="google-site-verification" content="your-google-token">
```

## Google Analytics

Set this in Vercel:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

`hooks/usePageAnalytics.js` loads GA lazily and sends SPA page views on route changes.

## Image Optimization

`components/common/OptimizedImage.jsx` creates responsive `srcset` values.

For Cloudinary URLs, it injects:

- `f_auto`
- `q_auto`
- `c_limit`
- responsive `w_` widths

Images also use:

- `loading="lazy"`
- `decoding="async"`

## Page Speed And Core Web Vitals

Implemented:

- React route code splitting with `React.lazy`
- Suspense skeleton loading
- Cloudinary preconnect
- responsive image `srcset`
- lazy image loading
- no heavy SEO/chart packages
- CSS-only admin charts
- small SVG favicon and OG placeholder

Recommended production checks:

- Run Lighthouse after deployment.
- Keep hero image under 200 KB.
- Use Cloudinary transformations for all uploaded media.
- Add width and height attributes when exact dimensions are known.
- Use Render/Vercel compression and CDN caching.

## Production Environment

```env
VITE_API_BASE_URL=https://your-render-api.onrender.com/api/v1
VITE_SITE_URL=https://kelvinecoproducts.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GSC_VERIFICATION=google-search-console-token
```

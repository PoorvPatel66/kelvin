# Admin Dashboard Module

## Purpose

The dashboard module powers the Kelvin Eco Products admin home screen with operational metrics for products, blogs, inquiries, categories, featured content, search, and visitor analytics.

## Files

- `controllers/dashboardController.js` receives Express requests, calls the service layer, and sends JSON responses.
- `services/dashboardService.js` owns all Prisma queries, pagination, lightweight caching, and aggregation logic.
- `routes/dashboardRoutes.js` registers protected dashboard endpoints.
- `prisma/schema.prisma` includes `VisitorAnalytics` for admin traffic reporting.

## Endpoints

All routes are protected by JWT and allow only `SUPER_ADMIN` and `ADMIN`.

- `GET /api/v1/admin/dashboard/summary`
  - Returns total products, blogs, inquiries, and categories.
  - Products, blogs, and categories ignore soft-deleted rows.

- `GET /api/v1/admin/dashboard/inquiries/monthly?year=2026`
  - Returns `Jan` through `Dec` inquiry counts for the selected year.
  - Uses UTC month boundaries to keep reporting stable across deployment regions.

- `GET /api/v1/admin/dashboard/inquiries/latest?page=1&limit=10`
  - Returns latest inquiries with pagination.
  - Supports optional `status` filter.

- `GET /api/v1/admin/dashboard/blogs/recent?page=1&limit=5`
  - Returns recent non-deleted blogs with category metadata.

- `GET /api/v1/admin/dashboard/products/featured?page=1&limit=6`
  - Returns featured non-deleted products with category and primary image.

- `GET /api/v1/admin/dashboard/search?q=paper&page=1&limit=10`
  - Searches products, blogs, and inquiries in parallel.
  - Returns totals and paginated data sections for each resource type.

- `GET /api/v1/admin/dashboard/visitors?year=2026`
  - Returns total visitors, current-month visitors, monthly visitor trend, top pages, and top sources.

## Prisma Query Strategy

- Count cards use `Promise.all` so products, blogs, inquiries, and categories are counted concurrently.
- List endpoints use `select` to return only dashboard fields instead of full records.
- Search runs product, blog, and inquiry lookups in parallel.
- Visitor top pages and top sources use Prisma `groupBy`.
- Pagination is clamped to avoid expensive accidental requests.

## Caching

The summary and monthly inquiry endpoints use an in-memory TTL cache for fast dashboard refreshes.

Production recommendation:

- Replace the local `Map` cache with Redis when running multiple Render instances.
- Use keys such as `dashboard:summary` and `dashboard:monthly-inquiries:{year}`.
- Invalidate cache after product, blog, inquiry, or category writes if real-time counts are required.

## Migration

After adding `VisitorAnalytics`, run:

```bash
npx prisma migrate dev --name admin-dashboard-analytics
npx prisma generate
```

Use `npx prisma migrate deploy` in production during Render deployment.

## Security

- `routes/dashboardRoutes.js` applies `protect` before every route.
- `authorize('SUPER_ADMIN', 'ADMIN')` blocks non-admin access.
- Search limits are clamped to reduce brute-force scraping risk.
- Dashboard responses avoid returning sensitive admin data or password fields.

## Performance

- Existing indexes on `Product.featured`, `Product.isDeleted`, `Blog.isDeleted`, `Inquiry.createdAt`, and status columns support dashboard filters.
- `VisitorAnalytics` adds indexes on `createdAt`, `path`, and `source`.
- For high traffic, store visitor events asynchronously through a queue before inserting into PostgreSQL.

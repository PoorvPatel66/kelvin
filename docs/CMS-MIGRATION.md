# Kelvin Eco Products CMS Migration

## Objective

Move Kelvin Eco Products from a mostly static React website with partial backend APIs to a central admin-managed CMS/CRM without breaking the public website.

This file is the implementation migration guide. `CMS-MIGRATION-PLAN.md` remains a planning reference, but this document uses the exact deliverable name requested in the master admin prompt.

## Migration Rules

1. Do not remove current public content until it has been seeded into PostgreSQL.
2. Do not create admin pages that do not control real public website data.
3. Keep frontend fallbacks during each migration step.
4. Build one domain at a time: schema, seed, API, admin UI, public read, test.
5. Every migration must have rollback notes.

## Phase 0: Inventory

Status: started.

Deliverables:

| Deliverable | Status |
| --- | --- |
| Admin CMS audit | Created |
| Website control matrix | Created |
| CMS architecture | Created |
| Admin route map | Created |
| Permission model | Created |
| Testing plan | Created |

## Phase 1: Schema Foundation

Add or verify Prisma models for:

| Model | Purpose |
| --- | --- |
| `SiteSetting` | Brand, contact, social, footer, form, and global settings |
| `Page` | Public page records |
| `PageSection` | Editable page sections with JSON content/media |
| `Menu` | Header/footer menu groups |
| `MenuItem` | Menu links and ordering |
| `SeoMetadata` | Page/product/blog SEO |
| `Testimonial` | Client reviews |
| `Lead` | CRM lead records |
| `Customer` | Customer/company records |
| `QuoteRequest` | Structured quotation requests |
| `Quotation` | Admin-created quotation records |
| `NewsletterSubscriber` | Newsletter signups |
| `ActivityLog` | Admin action auditing |
| `RolePermission` | Granular role permissions |

Migration command from backend:

```powershell
cd backend
npx.cmd prisma migrate dev --schema prisma/schema.prisma
npx.cmd prisma generate --schema prisma/schema.prisma
```

Prerequisite: PostgreSQL must be running and `DATABASE_URL` must point to the active database.

## Phase 2: Seed Current Website Content

Seed existing frontend content into database tables before switching public pages.

Source files to inspect:

| Source | Seed Target |
| --- | --- |
| `frontend/src/data/siteImages.js` | `MediaAsset`, `SiteSetting` |
| `frontend/src/data/productCatalog.js` | `Category`, `Product`, `ProductImage`, product specs |
| `frontend/src/data/blogs.js` | `Blog`, `BlogCategory`, `SeoMetadata` |
| `frontend/src/data/aboutData.js` | `Page`, `PageSection` |
| `Footer.jsx` and `Navbar.jsx` | `Menu`, `MenuItem`, `SiteSetting` |
| `seoConfig.js` and `schema.js` | `SeoMetadata`, global schema settings |

Do not delete the local data files immediately. Keep them as fallback until public API responses are verified.

## Phase 3: Admin APIs

Build protected CRUD endpoints for missing domains:

| Domain | API Prefix |
| --- | --- |
| Site settings | `/api/v1/admin/settings` |
| Pages | `/api/v1/admin/pages` |
| Page sections | `/api/v1/admin/pages/:pageId/sections` |
| Menus | `/api/v1/admin/menus` |
| SEO | `/api/v1/admin/seo` |
| Testimonials | `/api/v1/admin/testimonials` |
| Leads | `/api/v1/admin/leads` |
| Quote requests | `/api/v1/admin/quote-requests` |
| Quotations | `/api/v1/admin/quotations` |
| Newsletter | `/api/v1/admin/newsletter` |
| Users and roles | `/api/v1/admin/users`, `/api/v1/admin/roles` |
| Activity logs | `/api/v1/admin/activity-logs` |

Public read endpoints should be separate and safe:

| Domain | Public API Prefix |
| --- | --- |
| Site settings | `/api/v1/site-settings/public` |
| Pages | `/api/v1/pages/:slug` |
| Menus | `/api/v1/menus/:location` |
| SEO | `/api/v1/seo/:entityType/:slug` |
| Testimonials | `/api/v1/testimonials` |

## Phase 4: Admin UI Modules

Enable the disabled admin navigation modules only after their APIs are connected.

Suggested order:

1. Categories
2. Blogs
3. Pages
4. Menus
5. SEO
6. Testimonials
7. Quote Requests
8. Contact Enquiries
9. Newsletter
10. Settings
11. Users and Roles
12. Activity Logs

## Phase 5: Public Website Integration

Replace local data reads with API-backed services one page at a time.

| Public Page | Migration Strategy |
| --- | --- |
| Home | Fetch page sections, products, export countries, testimonials, blog previews |
| About | Fetch page sections and media; keep design code-owned |
| Products | Fetch categories/products from API; product detail uses product slug API |
| Blog | Fetch blog list/detail from API |
| Contact | Fetch contact settings and submit inquiries |
| Request Quote | Fetch product/category/options from API and submit quote request |

Each page should use API data first and fallback data only if the API is unavailable during migration.

## Phase 6: CRM and Email

Separate records by intent:

| Form | Target Record |
| --- | --- |
| Contact form | `Inquiry`, optional `Lead` |
| Request quote modal | `QuoteRequest`, optional `Lead` |
| Newsletter | `NewsletterSubscriber` |
| Brochure/catalog download | `Inquiry` or `Lead` with source metadata |

Email delivery should be performed by the backend using SMTP/SendGrid/Resend credentials. The browser cannot send from the visitor email account directly.

## Phase 7: SEO and Media

Admin SEO should control:

- Meta title
- Meta description
- Canonical URL
- OpenGraph image
- Twitter card image
- JSON-LD schema data
- Sitemap inclusion
- Robots directives

Media should support:

- Upload
- Replace
- Delete
- Alt text
- Folder grouping
- Public/private visibility
- Product/blog/page usage tracking

## Phase 8: Testing and Release

Release gates:

1. `npm.cmd run build` passes in `frontend`.
2. Backend tests pass.
3. Prisma generate succeeds.
4. Admin login works.
5. Product edited in admin changes public product page.
6. Blog edited in admin changes public blog page.
7. Contact and quote submissions create admin records.
8. SEO data appears in page head.
9. Admin routes are protected.
10. Mobile public pages and admin forms remain usable.

## Rollback Strategy

For every migrated page:

1. Keep local fallback data.
2. Add a feature flag or fallback branch around the API call.
3. If API/CMS fails, public UI should still render current static content.
4. Do not delete old static modules until the CMS has passed production verification.

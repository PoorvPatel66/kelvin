# Kelvin Eco Products Admin/CMS Audit

Audit date: 2026-08-12

## Executive Summary

The repository already contains a useful React admin shell and real CRUD screens for products, categories, blogs, media, website pages, inquiries, quote requests, contact enquiries, and newsletter submissions. Those modules use the Express API and Prisma/PostgreSQL. They should be improved, not replaced.

The central gap is data ownership: public product and blog pages still primarily read local JavaScript files, while the admin edits database records. `WebsitePage` records are editable in admin but are not consumed by public pages. This means an admin save does not yet control every corresponding public surface.

The prior admin also exposed placeholder routes for unsupported modules. Those routes create a false impression of functionality and must remain hidden until their database and API contracts exist.

## 1. Public Routes and Pages

| Route | Page | Current source |
| --- | --- | --- |
| `/` | `HomePage.jsx` | Components, local data, products/blog API with fallbacks |
| `/about` | `AboutPage.jsx` | JSX/local content and local assets |
| `/products` | `ProductsPage.jsx` | `productCatalog.js` |
| `/products/:slug` | `ProductDetailPage.jsx` | `productCatalog.js` |
| `/quality` | `QualityPage.jsx` | JSX/local content |
| `/blog` | `BlogListPage.jsx` | `blogs.js` |
| `/blog/:slug` | `BlogDetailPage.jsx` | `blogs.js` |
| `/contact` | `ContactPage.jsx` | JSX plus inquiry API |
| `/request-quote` | quote modal via `App.jsx` | inquiry API |

The navbar, footer, quote modal, floating WhatsApp control, SEO shell, route analytics, and public visual design must remain intact.

## 2. Important Public Sections

- Home: hero, benefits, product showcase, statistics, export/global reach, why choose Kelvin, testimonials, blog preview, CTA.
- About: hero, who we are, business story/content, capability/value sections, global outlook, CTA.
- Products: product hero, category filters, product catalogue, product detail modal/page, customization showcase.
- Blog: hero, category filters, article list, article detail.
- Contact: contact form, contact details, map/directions, business hours.

## 3. Hard-Coded Business Content

- `frontend/src/data/productCatalog.js`: canonical public catalogue and specifications.
- `frontend/src/data/blogs.js`: canonical public blog listing/detail content.
- `frontend/src/data/siteImages.js`: public asset mapping.
- Public page JSX/CSS: headings, section copy, contact details, export presentation, and calls to action.
- The quote modal derives products/sizes from the local catalogue.

These local modules should remain as temporary resilience fallbacks until seeded database records are verified in every environment. They must not remain a second writable source long term.

## 4. Product Architecture

- Prisma: `Category` 1:N `Product` 1:N `ProductImage`.
- Product supports slug, descriptions, material, sizes, capacity, MOQ, specifications JSON, usage, status, featured, category, soft delete, timestamps.
- Admin has list/create/edit/delete workflows and image/media integration.
- Backend has public list/detail/featured endpoints and protected admin mutations.
- Seed data includes the Kelvin catalogue, but deployed/local databases may contain stale subsets.
- Public list/detail pages are not yet database-first.

## 5. Blog Architecture

- Prisma: `Blog`, `BlogCategory`, and `BlogRelatedArticle`.
- Admin supports category/content/status/SEO-oriented editing.
- Backend exposes public published-blog reads and protected admin mutations.
- Public blog pages remain local-data-first, while the home preview already attempts API reads with fallback.

## 6. Media Architecture

- Prisma `MediaAsset` stores Cloudinary identifiers, URL, type, folder, dimensions, metadata, and timestamps.
- Existing Cloudinary/Multer middleware and media admin screen are useful foundations.
- Media reference safety (`Used On`) is not modeled yet. Deletion safety must be added before claiming a central asset manager.

## 7. Public Form Submissions

- Contact, request quote, newsletter, brochure, and WhatsApp events are represented by `InquiryType`.
- `Inquiry` and `InquiryNote` support status and internal notes.
- Admin has generic and filtered inquiry screens.
- These flows already follow public form -> API -> database -> admin.

## 8. Working Admin Modules

- Dashboard
- Products and product editor
- Categories
- Blogs
- Media library
- Website pages
- Leads/inquiries
- Quote requests
- Contact enquiries
- Newsletter

Reusable pieces include `AdminLayout`, `DataTable`, `PageHeader`, `StatusBadge`, `EmptyState`, authentication context, protected routes, Axios services, and toast handling.

## 9. Unsupported/Deferred Admin Modules

The current schema has no complete contracts for menus, SEO manager, product variants, catalogues, testimonials, customers, quotations/PDFs, users/roles beyond basic admins, notifications, activity logs, settings, backups, or full analytics reporting. These must not be displayed as working routes.

Existing `ExportCountry`, `Certification`, and `VisitorAnalytics` models are useful foundations, but production admin CRUD/reporting is not complete.

## 10. Backend APIs

Existing route families include authentication, products, categories, blogs, inquiries, media/uploads, dashboard, website-page administration, and visitor analytics. Public page-content reads are missing for `WebsitePage`, and global settings/navigation contracts do not exist.

## 11. Prisma Models

Current models: `Admin`, `Category`, `Product`, `ProductImage`, `Blog`, `BlogCategory`, `BlogRelatedArticle`, `Inquiry`, `InquiryNote`, `ExportCountry`, `Certification`, `MediaAsset`, `WebsitePage`, and `VisitorAnalytics`.

Migration additions required for the next phases:

1. Persistent, hashed admin OTP challenges and registered admin mobile numbers.
2. Global settings and navigation entities.
3. Product variants/specification rows if variants must be independently managed.
4. Media usage/reference records.
5. Customer, lead pipeline, quotation, quotation item, notification, and activity-log entities.
6. Typed page-section storage or validated section schemas.

No database reset or destructive migration is authorized.

## 12. Authentication Audit

JWT/cookie auth, bcrypt utilities, route protection, validation, Helmet, CORS, and rate limiting exist. Critical defects found in the owner OTP flow:

- Real owner name, password, mobile, and email fallbacks were embedded in source.
- OTP was logged to the server console.
- OTP could be returned by development API responses.
- Owner login rewrote/upserted the admin password from plaintext configuration.
- OTP state was process-memory-only and unsuitable for multiple instances.
- Forgot-password responses could expose reset material outside production.

These defects must be removed before expanding admin permissions.

## 13. Shared Admin/Public Code

- Shared API transport: `frontend/src/services/api.js`.
- Shared auth/route protection: `AuthContext.jsx`, `ProtectedRoute.jsx`.
- Shared public/admin entities: Product, Blog, Category, Inquiry, MediaAsset, WebsitePage.
- Public and admin should share API records, not visual components. Admin remains a productivity UI; public pages retain their current presentation.

## 14. Safe Cleanup

Safe to remove after route cleanup:

- `AdminPlaceholderPage.jsx` when no route imports it.
- Disabled placeholder navigation entries.
- Fake notification action until notification persistence exists.
- Insecure owner OTP fallback/logging code.

Must remain:

- Public pages/components/styles/assets.
- Working admin pages/components/services.
- Existing backend controllers/routes/models/migrations.
- Local product/blog data until database parity and public API fallbacks are verified.

## 15. Missing APIs

- Public `WebsitePage` read by slug with publication filtering.
- Global settings and navigation CRUD/public reads.
- Typed page-section validation and media references.
- Variants, customers, quotations/PDF, activity logs, notifications, backups, and complete analytics endpoints.
- Export-country/certification production admin CRUD if exposed.

## 16. Implementation Plan

### Milestone 1: Truthful and secure core

- Remove fake admin routes/actions.
- Replace insecure owner OTP behavior with database-backed credentials/challenges and configured SMS delivery.
- Make product and blog public pages API-first with preserved local fallbacks.
- Verify dashboard counts and seed parity.

### Milestone 2: Website control plane

- Add public page API.
- Create validated typed editors for current Home/About/Quality/Contact sections.
- Add global settings and navigation models/APIs/admin pages.
- Update navbar/footer/contact to consume global settings with stable fallback.

### Milestone 3: Catalogue depth and media safety

- Add variant model/editor and relation-safe category handling.
- Add media usage references, folders, replacement, and deletion guards.
- Complete customization content/media control using the same media library.

### Milestone 4: CRM and documents

- Add customers, lead pipeline, quotation/items, safe CSV/XLSX exports, and PDF generation.
- Add notifications and activity logs from real events.

### Milestone 5: governance and operations

- Add admin user management and server-side RBAC roles.
- Add SEO manager, export markets, certifications/testimonials only with genuine records.
- Add tested analytics and backup operations.

## Definition of Done

A module is complete only when its admin mutation is validated server-side, persisted by Prisma, visible through the appropriate public/admin read path, authorization is tested, and the UI handles loading, errors, and empty data. A sidebar link alone is never completion.

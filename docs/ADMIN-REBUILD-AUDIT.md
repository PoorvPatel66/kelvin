# Kelvin Eco Products Admin Rebuild Audit

This is the required audit entry point for the admin rebuild. The detailed repository audit is maintained in [ADMIN-CMS-AUDIT.md](./ADMIN-CMS-AUDIT.md), and the public-to-admin field mapping is maintained in [WEBSITE-CONTROL-MATRIX.md](./WEBSITE-CONTROL-MATRIX.md).

## Verified Public Surface

- Routes: `/`, `/about`, `/products`, `/products/:slug`, `/quality`, `/blog`, `/blog/:slug`, `/contact`, and `/request-quote`.
- Products: the list and detail routes now read the public product API, with the existing local catalogue retained only as an availability fallback during migration or API downtime.
- Blogs: the list and detail routes now read published blog records from the public blog API, with existing editorial data retained only as an availability fallback.
- Contact and quote submissions: both use the existing inquiry API and are managed through the corresponding admin inquiry views.
- Public visual composition, routing, responsive behavior, and animations remain frontend-owned.

## Verified Admin Surface

Implemented and exposed modules are Dashboard, Pages, SEO Manager, Media Library, Products, Categories, Blogs, Testimonials, Certifications, Export Markets, Customers, Leads, Quote Requests, Contact Enquiries, Newsletter, Site Settings, and Navigation. Placeholder navigation and routes for unimplemented modules have been removed so the admin does not advertise fake actions.

The existing CRUD implementations for products, categories, blogs, inquiries, media, website pages, site settings, navigation, testimonials, certifications, export markets, and customers are preserved. Unsupported modules such as formal quotations, catalogs, notifications, activity logs, backups, and full RBAC require schema and API work and must remain hidden until implemented end to end.

## Backend and Database

The backend uses Express, Prisma, PostgreSQL, JWT cookies, Cloudinary, Multer, Nodemailer, validation middleware, rate limiting, Helmet, and CORS. Existing models include Admin, Category, Product, ProductImage, Blog, BlogCategory, BlogRelatedArticle, Inquiry, InquiryNote, Customer, CustomerNote, ExportCountry, Certification, Testimonial, MediaAsset, WebsitePage, SiteSetting, NavigationItem, and VisitorAnalytics.

The secure owner-login migration adds an active flag, mobile identity, last-login timestamp, and persistent hashed OTP challenges. It preserves existing records and does not reset the database.

## Authentication Findings and Repair

The previous owner OTP implementation included development disclosure paths and insecure credential fallback behavior. Those paths were removed. Owner credentials now resolve from a hashed Admin database record, OTP challenges are hashed and stored in PostgreSQL, resend and attempt limits are enforced, and OTP delivery must succeed through the configured SMS provider. OTP values are never returned to the browser or written to application logs. The public first-admin setup endpoint was removed; initial owner provisioning now uses the server-side seed command only.

## Hard-Coded Data and Migration Rule

Product catalogue data, blog data, About copy, and site image mappings still exist locally as resilience fallbacks or code-owned presentation data. Products, blogs, the first typed WebsitePage fields, shared navigation, footer links, contact details, social links, and site identity now use database-first public reads. Remaining deep page copy must continue moving incrementally into typed WebsitePage editors; raw JSON editing and an all-at-once migration would risk breaking the current public design.

## Pages CMS Milestone

Published WebsitePage records are available through `GET /api/v1/pages/:identifier` and the compatibility route `GET /pages/:identifier`. The endpoint returns published records only and is covered by controller tests.

The admin Pages editor now exposes typed fields for Home, About, Products, Customize, Quality, Blog, and Contact. Their public hero or selected content sections and page SEO metadata read those records while preserving the existing layouts and local fallback copy. The Products page customization section also reads the dedicated `customize` WebsitePage record.

## Central SEO Manager Milestone

The protected `/admin/seo` workspace now provides a single database-backed editor for page, product, and blog metadata. It reports optimized and incomplete records, supports type filtering, search and pagination, and persists SEO title, description, keywords, canonical URL, robots directives, and social image fields through `/api/v1/admin/seo`.

Public page, product-detail, and blog-detail metadata prefer those database fields while preserving the existing local defaults when a field has not been completed. The additive migration `20260813170155_add_central_seo_manager` extends existing records without deleting or reseeding business data. Controller tests cover SEO summary, listing, and update behavior.

## Shared Website Controls Milestone

The `SiteSetting` singleton and ordered `NavigationItem` records provide a shared source of truth for the public navbar and footer. Public reads are available through `/api/v1/site-settings` and `/api/v1/navigation`; protected CRUD is available through `/api/v1/admin/site-settings` and `/api/v1/admin/navigation`.

The admin exposes `/admin/site-settings` and `/admin/navigation`. The public site retains local fallback configuration so a temporary API or database outage does not remove navigation or contact information. The migration for this milestone is `20260813120000_add_site_settings_navigation`.

## Testimonials, Export Markets, and Certifications Milestones

Testimonials are managed at `/admin/testimonials` and published through `/api/v1/testimonials`. Export markets are managed at `/admin/export-markets` and published through `/api/v1/export-countries`. Both public components retain their existing local display data as resilience fallbacks while treating active database records as the primary source.

Certifications are managed at `/admin/certifications` and published through `/api/v1/certifications`. Admins can maintain issuer, certificate number, validity dates, status, display order, image, and document URL. The public Quality page renders only active, non-deleted records and does not fabricate fallback certifications.

The local database verification on 2026-08-13 confirmed 13 non-deleted products, 7 website pages, and 2 non-deleted blogs after the SEO migration. Earlier module verification also confirmed 3 testimonials, 16 navigation items, and 9 active export markets.

## Customer CRM Milestone

The protected `/admin/customers` workspace is backed by `Customer` and `CustomerNote` records. It supports customer creation and editing, status/source filtering, search, soft archive, profile history, private admin notes, and spreadsheet-safe CSV export through `/api/v1/admin/customers`.

Public contact, request-quote, newsletter, brochure, and WhatsApp inquiry capture now normalizes the submitter email, upserts the matching customer, and links the new inquiry inside one database transaction. The additive migration `20260814043002_add_customer_crm` preserves existing inquiry records and backfills customer links by normalized email.

## Required Remaining Work

1. Apply the verified migrations and seed command in each deployment environment before promoting a release.
2. Configure and verify a production SMS provider.
3. Continue typed WebsitePage migration for deeper section copy and media without changing public layouts.
4. Add catalogs, formal quotations, notifications, activity logs, and RBAC in separate safe migrations.
5. Add integration tests for each new public-admin data flow before exposing its navigation item.

## Removal Safety

Safe removals are limited to obsolete admin placeholders, dead routes, and duplicated presentation code proven unused. Public components, public assets, existing API controllers, Prisma models, and working admin CRUD logic must remain unless a tested replacement exists.

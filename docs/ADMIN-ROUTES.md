# Kelvin Eco Products Admin Routes

Status date: 2026-08-14

This document lists only routes backed by real UI and API behavior. Unsupported roadmap modules are intentionally absent from the sidebar and router.

## Frontend Admin Routes

All routes except `/admin/login` are nested under `ProtectedRoute` and `AdminLayout` in `frontend/src/App.jsx`.

| Route | Component | Purpose |
| --- | --- | --- |
| `/admin/login` | `AdminLoginPage` | Owner/admin authentication |
| `/admin`, `/admin/dashboard` | `AdminDashboardPage` | Operational summary |
| `/admin/products` | `AdminProductsPage` | Product list and management |
| `/admin/products/new` | `AdminProductEditorPage` | Create product |
| `/admin/products/:id/edit` | `AdminProductEditorPage` | Edit product |
| `/admin/categories` | `AdminCategoriesPage` | Category CRUD |
| `/admin/blogs` | `AdminBlogsPage` | Blog CRUD and publishing |
| `/admin/pages` | `AdminPagesPage` | Typed public-page content and SEO fields |
| `/admin/seo` | `AdminSeoPage` | Central page, product, and blog SEO management |
| `/admin/navigation` | `AdminNavigationPage` | Header and footer navigation CRUD |
| `/admin/site-settings` | `AdminSiteSettingsPage` | Shared brand, contact, office, and social settings |
| `/admin/media` | `AdminMediaPage` | Cloudinary-backed media library |
| `/admin/testimonials` | `AdminTestimonialsPage` | Homepage testimonial CRUD and ordering |
| `/admin/export-markets` | `AdminExportMarketsPage` | Export-country CRUD and ordering |
| `/admin/certifications` | `AdminCertificationsPage` | Verified certification CRUD, ordering, publishing, and media |
| `/admin/customers` | `AdminCustomersPage` | Customer CRM, linked inquiry history, internal notes, filters, and CSV export |
| `/admin/leads` | `AdminInquiriesPage` | All captured inquiries |
| `/admin/quotes` | `AdminInquiriesPage` | Request-quote inquiries |
| `/admin/contact-enquiries` | `AdminInquiriesPage` | Contact-form inquiries |
| `/admin/newsletter` | `AdminInquiriesPage` | Newsletter submissions |

## Enabled Sidebar Groups

- **Overview:** Dashboard
- **Website:** Pages, SEO Manager, Navigation, Site Settings, Media Library
- **Catalog:** Products, Categories
- **Content:** Blogs, Testimonials, Certifications
- **Sales:** Customers, Leads, Quote Requests, Contact Enquiries
- **Marketing:** Export Markets, Newsletter

## Backend API Mounts

| API Prefix | Purpose |
| --- | --- |
| `/api/v1/auth` | Admin authentication and owner OTP flow |
| `/api/v1/products`, `/api/v1/admin/products` | Public product reads and protected management |
| `/api/v1/categories`, `/api/v1/admin/categories` | Public category reads and protected management |
| `/api/v1/blogs`, `/api/v1/admin/blogs` | Public blog reads and protected management |
| `/api/v1/inquiries`, `/api/v1/contact` | Form capture and protected inquiry management |
| `/api/v1/admin/dashboard` | Dashboard metrics |
| `/api/v1/pages`, `/api/v1/admin/pages` | Published page content and protected editing |
| `/api/v1/admin/seo` | Protected page, product, and blog SEO summary, listing, and updates |
| `/api/v1/site-settings`, `/api/v1/admin/site-settings` | Shared site configuration |
| `/api/v1/navigation`, `/api/v1/admin/navigation` | Public and protected navigation data |
| `/api/v1/testimonials`, `/api/v1/admin/testimonials` | Public testimonials and protected CRUD |
| `/api/v1/export-countries`, `/api/v1/admin/export-countries` | Public export markets and protected CRUD |
| `/api/v1/certifications`, `/api/v1/admin/certifications` | Published certifications and protected CRUD |
| `/api/v1/admin/certificates/:id/icon` | Protected certification image upload and removal |
| `/api/v1/admin/customers` | Protected customer CRM CRUD, profiles, notes, and CSV export |
| `/api/v1/uploads`, `/api/v1/admin` | Uploads and media management |

Legacy aliases such as `/admin/products`, `/products`, and `/api/auth` remain mounted for backward compatibility.

## Protection Rules

1. Every `/admin/*` page except `/admin/login` requires an authenticated admin session.
2. The API client stores the bearer token as `kelvin_admin_token`; backend auth also supports the configured secure cookie flow.
3. Missing or expired authentication redirects the frontend to `/admin/login`.
4. Protected write APIs require `ADMIN` or `SUPER_ADMIN` authorization.
5. Roadmap modules are not added to navigation until their model, API, validation, authorization, UI, and tests all exist.

## Intentionally Hidden Roadmap Modules

Product variants, catalogs, formal quotation documents, analytics reporting, admin users/roles, activity logs, notifications, and backups remain hidden. Their labels must not be reintroduced as placeholders.

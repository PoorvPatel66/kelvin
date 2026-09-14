# Kelvin Eco Products CMS Architecture

## Goal

Build a central admin CMS that controls Kelvin Eco Products website content, media, SEO, menus, forms, and business records without breaking the current public website.

The CMS should be a structured control system, not a free-form website builder. Admin users should edit data and media safely while the React frontend preserves the approved design system.

## Architecture Principles

1. **Database as source of truth**: Admin-managed content should live in PostgreSQL through Prisma.
2. **Public APIs are stable**: Public pages should consume safe read-only endpoints.
3. **Admin APIs are protected**: All admin writes require JWT and role authorization.
4. **Media is centralized**: Images/files should be uploaded to Cloudinary and tracked in `MediaAsset`.
5. **Design remains code-owned**: Admin can change text, images, links, section visibility, SEO, and ordering, not arbitrary CSS/layout code.
6. **Migration is incremental**: Each public section moves from hard-coded data to CMS one module at a time.
7. **Fallback data remains during transition**: Existing local data can be used as fallback until each CMS module is verified.

## Target Data Model Additions

Existing Prisma models already cover products, blogs, inquiries, media, export countries, certifications, and admins. The CMS layer should add these models.

### SiteSetting

Stores global business identity and contact settings.

Recommended fields:

| Field | Purpose |
| --- | --- |
| `id` | UUID |
| `key` | Unique machine key, for example `contact.email.primary` |
| `value` | JSON value |
| `group` | `brand`, `contact`, `social`, `footer`, `forms`, `seo` |
| `isPublic` | Whether public API can expose it |
| `createdAt`, `updatedAt` | Audit timestamps |

### Page

Stores public page records.

Recommended fields:

| Field | Purpose |
| --- | --- |
| `id` | UUID |
| `title` | Admin title |
| `slug` | `home`, `about`, `products`, `blog`, etc. |
| `route` | Public route |
| `status` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `sortOrder` | Optional ordering |
| `createdAt`, `updatedAt` | Audit timestamps |

### PageSection

Stores structured editable sections inside each page.

Recommended fields:

| Field | Purpose |
| --- | --- |
| `id` | UUID |
| `pageId` | Relation to Page |
| `sectionKey` | Stable key, for example `home.hero` |
| `sectionType` | `HERO`, `TEXT_IMAGE`, `PRODUCT_GRID`, `CTA`, `EXPORT_MAP`, etc. |
| `content` | JSON text/buttons/repeater data |
| `media` | JSON references to `MediaAsset` IDs or URLs |
| `settings` | JSON section flags such as `isVisible` |
| `sortOrder` | Display order |
| `status` | `DRAFT`, `PUBLISHED` |
| `createdAt`, `updatedAt` | Audit timestamps |

### SeoMetadata

Stores page/product/blog SEO metadata.

Recommended fields:

| Field | Purpose |
| --- | --- |
| `id` | UUID |
| `entityType` | `PAGE`, `PRODUCT`, `BLOG`, `CATEGORY` |
| `entityId` | ID or slug |
| `title` | Meta title |
| `description` | Meta description |
| `canonicalUrl` | Canonical URL |
| `ogTitle`, `ogDescription`, `ogImage` | OpenGraph |
| `twitterTitle`, `twitterDescription`, `twitterImage` | Twitter cards |
| `jsonLd` | Structured data JSON |
| `robots` | Index/follow options |

### Menu and MenuItem

Controls header/footer navigation.

Recommended fields:

| Model | Key Fields |
| --- | --- |
| `Menu` | `id`, `name`, `location`, `status` |
| `MenuItem` | `id`, `menuId`, `label`, `url`, `route`, `parentId`, `sortOrder`, `target`, `isVisible` |

### Testimonial

Controls client review/testimonial sections.

Recommended fields:

| Field | Purpose |
| --- | --- |
| `id` | UUID |
| `name` | Reviewer name |
| `company` | Company/role |
| `quote` | Testimonial text |
| `rating` | Optional |
| `sourceUrl` | Google review or source link |
| `avatar` | Optional media |
| `status` | `DRAFT`, `PUBLISHED` |

### AdminActivityLog

Records admin actions.

Recommended fields:

| Field | Purpose |
| --- | --- |
| `id` | UUID |
| `adminId` | Actor |
| `action` | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, etc. |
| `entityType` | Changed resource |
| `entityId` | Changed record ID |
| `metadata` | JSON diff/context |
| `ipAddress`, `userAgent` | Security trace |
| `createdAt` | Timestamp |

## API Architecture

### Public CMS APIs

These endpoints should never expose unpublished drafts or admin-only fields.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/site/settings` | Public brand/contact/social settings |
| `GET` | `/api/v1/navigation/:location` | Header/footer menu |
| `GET` | `/api/v1/pages/:slug` | Page section payload |
| `GET` | `/api/v1/seo/:entityType/:entityId` | SEO metadata |
| `GET` | `/api/v1/export-countries` | Published export countries |
| `GET` | `/api/v1/testimonials` | Published testimonials |

### Admin CMS APIs

All admin CMS endpoints require JWT and role authorization.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET/POST` | `/api/v1/admin/site-settings` | Manage settings |
| `GET/POST` | `/api/v1/admin/pages` | Manage pages |
| `GET/PUT` | `/api/v1/admin/pages/:id` | Edit page metadata |
| `GET/POST` | `/api/v1/admin/pages/:id/sections` | Manage page sections |
| `PUT` | `/api/v1/admin/sections/:id` | Update section content/media/settings |
| `GET/POST` | `/api/v1/admin/menus` | Manage menus |
| `GET/POST` | `/api/v1/admin/seo` | Manage SEO metadata |
| `GET` | `/api/v1/admin/activity-logs` | View audit logs |
| `GET/POST` | `/api/v1/admin/testimonials` | Manage testimonials |
| `GET/POST` | `/api/v1/admin/export-markets` | Manage export countries |

## Frontend CMS Architecture

### Service Layer

Add these services:

| File | Purpose |
| --- | --- |
| `frontend/src/services/cmsService.js` | Fetch pages, sections, menus, site settings |
| `frontend/src/services/adminCmsService.js` | Admin CRUD for settings/pages/sections/menus/SEO |
| `frontend/src/services/adminInquiryService.js` | Admin list/detail/status/notes for enquiries and quotes |

### Page Adapters

Each public page should use a small adapter that maps CMS JSON into existing component props.

Example migration pattern:

1. Fetch CMS page payload.
2. If CMS payload exists and is published, render CMS values.
3. If missing, fallback to current static data.
4. Remove fallback only after admin workflow is stable.

This prevents a blank website if CMS records are missing.

### Admin Module Structure

Recommended frontend structure:

```text
frontend/src/admin/pages/
  AdminPagesPage.jsx
  AdminPageEditorPage.jsx
  AdminMenusPage.jsx
  AdminSeoPage.jsx
  AdminSettingsPage.jsx
  AdminInquiriesPage.jsx
  AdminQuotesPage.jsx
  AdminTestimonialsPage.jsx
  AdminExportMarketsPage.jsx
```

Reusable admin components:

```text
frontend/src/admin/components/
  PageHeader.jsx
  DataTable.jsx
  StatusBadge.jsx
  MediaPicker.jsx
  SectionEditor.jsx
  JsonFieldEditor.jsx
  ConfirmDialog.jsx
```

## Admin Permissions

Current role enum includes `SUPER_ADMIN` and `ADMIN`.

Recommended first permission rules:

| Module | SUPER_ADMIN | ADMIN |
| --- | --- | --- |
| Dashboard | Full | Read |
| Products | Full | Full |
| Blogs | Full | Full |
| Media | Full | Upload/update |
| Pages | Full | Edit content only |
| Menus | Full | Read |
| SEO | Full | Edit metadata |
| Inquiries | Full | Read/update status |
| Settings | Full | Read |
| Users/Roles | Full | No access |
| Backups | Full | No access |

Fine-grained permissions can be added later through `RolePermission`.

## CMS Editing Boundary

Admin should control:

- Text
- Images
- Buttons
- URLs
- SEO metadata
- Section visibility
- Section order where safe
- Product details
- Blog content
- Form option lists
- Social/contact values

Admin should not control:

- Raw CSS
- Arbitrary JavaScript
- Component imports
- Database connection settings
- Auth secrets
- Cloudinary credentials
- Layout logic beyond approved section schemas

## Media Architecture

Use `MediaAsset` as the central media record.

Required media fields:

- `url`
- `publicId`
- `type`
- `folder`
- `alt`
- `caption`
- `width`
- `height`
- `format`
- `bytes`
- `usedBy`

Admin image replacement should update a media reference or section media field, not directly edit JSX.

## SEO Architecture

SEO should support:

- Meta title
- Meta description
- Canonical URL
- OpenGraph image
- Twitter card image
- JSON-LD per page/product/blog
- Robots index/follow flags
- Sitemap generation
- Redirects if route/slug changes

The current frontend SEO files should become fallback/default templates, while CMS records provide override values.

## Form and Notification Architecture

All public submissions should create database records first, then send email notification.

Recommended flow:

```text
Frontend form
  -> API validation
  -> Prisma Inquiry record
  -> Notification service email
  -> Admin dashboard record
  -> User success response
```

Email must be sent from a verified SMTP/API sender. Visitor email should be stored in the database and used as `replyTo`, not as the sender account.

## Deployment Considerations

Required production environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `COOKIE_EXPIRE`
- `CLOUDINARY_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_SECRET`
- `SMTP_HOST` or email provider API key
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `FRONTEND_URL`
- `VITE_API_BASE_URL`

## Success Criteria

The CMS is considered functional when this workflow works end-to-end:

1. Admin logs in.
2. Admin edits one website section in `/admin/pages`.
3. Change is saved to PostgreSQL.
4. Public page renders updated content without deployment.
5. Admin uploads/replaces one image.
6. Public page renders the new Cloudinary image.
7. Contact/quote submissions appear in admin and trigger notification.
8. SEO metadata can be changed from admin and reflected publicly.

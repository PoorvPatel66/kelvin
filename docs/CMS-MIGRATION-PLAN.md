# Kelvin Eco Products CMS Migration Plan

## Migration Rule

Do not convert the full website to CMS control in one pass.

The safe approach is module-by-module migration:

1. Build the CMS foundation.
2. Connect one low-risk public area.
3. Verify admin edit -> API -> database -> public render.
4. Repeat for the next module.

## Phase 0: Audit and Planning

Status: ready to start from these documents.

Deliverables:

- `docs/ADMIN-CMS-AUDIT.md`
- `docs/CMS-ARCHITECTURE.md`
- `docs/CMS-MIGRATION-PLAN.md`

Validation:

- Existing public routes mapped.
- Existing admin routes mapped.
- Backend APIs mapped.
- Hard-coded content identified.
- CMS target modules defined.

## Phase 1: CMS Core Schema

Goal: add the core CMS tables without changing public page behavior.

Database additions:

- `SiteSetting`
- `Page`
- `PageSection`
- `SeoMetadata`
- `Menu`
- `MenuItem`
- `Testimonial`
- `AdminActivityLog`

Backend additions:

- CMS Prisma queries
- Admin CMS controllers/services/routes
- Public read-only CMS controllers/routes
- Validation middleware
- Activity logging helper

Frontend additions:

- `cmsService.js`
- `adminCmsService.js`
- Admin pages for settings/pages/menus/SEO can remain minimal first.

Validation:

- Prisma migration runs successfully.
- Admin can create/update a setting.
- Public API can read published settings.
- Existing website still renders unchanged.

## Phase 2: Admin Foundation Cleanup

Goal: convert current disabled placeholder modules into real CMS entry points.

Admin modules:

- Website Pages
- Menus
- SEO
- Settings
- Activity Logs

Work items:

- Replace placeholder page for each module with a working CRUD shell.
- Keep disabled modules disabled until backend endpoints are present.
- Add consistent loading/error/empty states.
- Add protected route checks and role restrictions.

Validation:

- Admin sidebar only enables modules that work.
- Admin CRUD writes to PostgreSQL.
- Unauthorized users cannot access protected endpoints.

## Phase 3: Media Library

Goal: make images replaceable from admin.

Work items:

- Add media list/search/filter.
- Add image alt/caption editing.
- Add usage reference support.
- Add safe delete rules.
- Add media picker component for CMS section editors.

Validation:

- Upload works through Cloudinary.
- Admin can see uploaded assets.
- Admin can select image for a CMS section.
- Deleting a used media asset is blocked or warned.

## Phase 4: Forms and Sales Pipeline

Goal: make all public form submissions manageable from admin.

Modules:

- Contact Enquiries
- Quote Requests
- Newsletter
- Brochure Downloads
- WhatsApp Leads

Work items:

- Build inquiry list with type/status filters.
- Build inquiry detail view.
- Add status updates: `NEW`, `OPEN`, `REPLIED`, `CLOSED`.
- Add notes.
- Add CSV export.
- Add resend notification action.
- Add dashboard counters.

Validation:

- Contact form creates Contact Enquiry.
- Request quote creates Quote Request.
- Newsletter creates Newsletter record.
- Records are visible in admin.
- Email notification uses verified sender and visitor `replyTo`.

## Phase 5: Product CMS Connection

Goal: make product admin edits control the product page.

Current issue:

- The public product page uses `frontend/src/data/productCatalog.js`.
- Admin product CRUD writes to backend product APIs.

Migration steps:

1. Add missing product fields or improve Product JSON structure as needed.
2. Expose public product API with all catalogue data required by the current modal/table UI.
3. Update `ProductsPage.jsx` to fetch backend products with static fallback.
4. Update product detail/modal to consume backend product detail shape.
5. Keep `productCatalog.js` as fallback until backend data is complete.
6. Add admin UI fields for images, available colours, features, material, usage, coating, packaging details, and size/specification tables.

Validation:

- Create/edit product in admin.
- Public product page shows the change.
- Product modal shows all details without cropping.
- Soft delete hides product publicly.
- Static fallback is only used if API fails.

## Phase 6: Blog CMS Connection

Goal: make blog admin edits control `/blog` and `/blog/:slug`.

Migration steps:

1. Enable `/admin/blogs` UI.
2. Add blog category management.
3. Add thumbnail/cover media picker.
4. Add publish/draft/featured controls.
5. Update public blog list/detail to use backend API with static fallback.
6. Add SEO metadata per blog.

Validation:

- Admin creates blog.
- Public blog list shows it after publish.
- Draft blogs remain hidden.
- Blog detail page renders content and SEO correctly.

## Phase 7: Home Page CMS

Goal: control the homepage without changing approved design.

Recommended section keys:

- `home.hero`
- `home.usp`
- `home.products`
- `home.customization`
- `home.stats`
- `home.export`
- `home.whyChoose`
- `home.testimonials`
- `home.cta`

Migration steps:

1. Seed the current homepage content into `Page` and `PageSection`.
2. Add admin section editor for simple fields.
3. Update Home page to read CMS payload with fallback.
4. Connect image fields through Media Library.

Validation:

- Admin changes hero text.
- Admin changes hero image.
- Admin hides/shows a section.
- Public homepage updates without redeploy.

## Phase 8: About Page CMS

Goal: control About page copy and image sections safely.

Recommended section keys:

- `about.hero`
- `about.whoWeAre`
- `about.story`
- `about.missionVisionValues`
- `about.whyKelvin`
- `about.howWeWork`
- `about.globalReach`
- `about.cta`

Migration steps:

1. Seed current About copy into CMS.
2. Keep advanced layout code-owned.
3. Expose text/image/repeater fields only.
4. Keep removed/rejected journey experiments out unless user explicitly re-approves.

Validation:

- Admin edits Who We Are copy.
- Admin changes About images.
- Public page keeps design intact.

## Phase 9: Menus, Footer, and Site Settings

Goal: make global content editable.

Work items:

- Header menu editor.
- Footer menu editor.
- Social links editor.
- Contact settings editor.
- WhatsApp number editor.
- Logo/favicon editor.
- Business hours editor.

Validation:

- Admin changes phone/email/website.
- Header/footer update publicly.
- Broken links are prevented by validation where possible.

## Phase 10: SEO, Sitemap, and Redirects

Goal: make SEO production-safe.

Work items:

- SEO metadata editor.
- JSON-LD editor with validation.
- Sitemap generation from published pages/products/blogs.
- Robots settings.
- Redirect manager for changed slugs.

Validation:

- Page source/meta tags reflect CMS SEO.
- Product/blog schema remains valid.
- Old slug redirects to new slug.

## Phase 11: Security and Operations

Goal: make admin production-safe.

Work items:

- Rate-limit login.
- Enforce strong passwords.
- Add password reset with expiring token/OTP.
- Add activity logs.
- Add role permission checks.
- Add backup/export process.
- Add Sentry/logging hooks if configured.

Validation:

- Failed login attempts are rate-limited.
- Admin changes are logged.
- SUPER_ADMIN-only modules are blocked for ADMIN.

## Decommission Plan for Static Data

Static frontend data should not be deleted immediately.

| File | Keep Until |
| --- | --- |
| `productCatalog.js` | Product API contains complete catalogue fields and public page fallback is no longer needed |
| `blogs.js` | Blog CMS is complete and seeded |
| `aboutData.js` | About CMS is complete and seeded |
| `siteImages.js` | Media library and site settings control all image references |
| `seoConfig.js` | SEO CMS provides page/product/blog metadata |

## Rollback Strategy

Every phase should be reversible:

1. Keep static fallback during migration.
2. Feature flag new CMS reads if needed.
3. Do not delete legacy data until after verification.
4. Keep migrations additive first.
5. Use soft delete for content records.

## Testing Checklist

Run these checks after each implementation phase:

- Frontend build.
- Backend boot.
- Prisma generate.
- Prisma migration on local database.
- Protected admin route access.
- Public route render.
- Form submit.
- Image upload.
- SEO source inspection.
- Mobile responsive spot-check for changed pages.

Recommended local commands:

```powershell
cd frontend
npm.cmd run build

cd ..\backend
npx.cmd prisma generate
npx.cmd prisma migrate dev
npm.cmd run dev
```

Use `npx.cmd` on Windows PowerShell if `npx.ps1` execution policy causes issues.

## Next Recommended Step

Implement Phase 1 only:

1. Add CMS core Prisma models.
2. Create migration.
3. Seed current global settings.
4. Add public read-only settings endpoint.
5. Add one admin Settings page.

Do not start Home/About/Product CMS migration until Phase 1 is stable.

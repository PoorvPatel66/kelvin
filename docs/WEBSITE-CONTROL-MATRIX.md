# Kelvin Eco Products Website Control Matrix

Status date: 2026-08-14

Legend: **Connected** means an admin change persists and the relevant public/admin read uses the same database record. **Partial** means an API or admin editor exists but the public surface still has local content/fallbacks. **Deferred** means no honest production contract exists yet.

| Public component/content | Admin module | Database | API | Status |
| --- | --- | --- | --- | --- |
| Home product showcase | Products | `Product`, `ProductImage`, `Category` | `GET /api/v1/products`, admin product APIs | Partial: API-first with fallback |
| Product catalogue | Products | `Product`, `ProductImage`, `Category` | product list/detail APIs | Partial: local catalogue still fallback |
| Product detail | Products | `Product`, `ProductImage` | `GET /api/v1/products/:slug` | Partial |
| Product categories | Categories | `Category` | category APIs | Connected in admin; public filters need API mapping |
| Home blog preview | Blogs | `Blog`, `BlogCategory` | public/admin blog APIs | Partial: fallback remains |
| Blog listing/detail | Blogs | `Blog`, `BlogCategory`, `BlogRelatedArticle` | blog list/detail APIs | Partial: local blog fallback remains |
| Contact form | Contact Enquiries | `Inquiry`, `InquiryNote` | inquiry/contact APIs | Connected |
| Request quote modal | Quote Requests | `Inquiry`, `InquiryNote` | inquiry/request-quote API | Connected |
| Newsletter forms | Newsletter | `Inquiry` (`NEWSLETTER`) | inquiry/newsletter API | Connected where form is rendered |
| Leads/inquiry inbox | Leads | `Inquiry`, `InquiryNote` | protected inquiry APIs | Connected |
| Customer CRM | Customers | `Customer`, `CustomerNote`, `Inquiry` | protected customer CRUD/profile/note/export APIs | Connected; public inquiries upsert and link customer profiles |
| Uploaded media | Media Library | `MediaAsset` + Cloudinary | media/upload APIs | Connected; reference safety deferred |
| Home page hero/selected content and SEO | Pages | `WebsitePage` | public/admin page APIs | Connected for typed fields; deeper sections remain code-owned |
| About page hero/Who We Are and SEO | Pages | `WebsitePage` | public/admin page APIs | Connected for typed fields; deeper sections remain code-owned |
| Products page hero and SEO | Pages | `WebsitePage` | public/admin page APIs | Connected for typed fields |
| Customize section copy | Pages | `WebsitePage` | public/admin page APIs | Connected to the Products-page customization section |
| Quality page hero and SEO | Pages | `WebsitePage` | public/admin page APIs | Connected for typed fields |
| Blog page hero and SEO | Pages | `WebsitePage` | public/admin page APIs | Connected for typed fields; articles remain in Blogs |
| Contact-page hero and SEO | Pages / future Settings | `WebsitePage` | public/admin page APIs | Connected for typed fields; contact data remains code-owned |
| Header logo/navigation/CTA | Navigation + Site Settings | `NavigationItem`, `SiteSetting` | public/admin navigation and settings APIs | Connected |
| Footer contact/social/copyright | Site Settings + Navigation | `SiteSetting`, `NavigationItem` | public/admin navigation and settings APIs | Connected |
| Page/product/blog SEO | SEO Manager | `WebsitePage`, `Product`, `Blog` | `GET/PATCH /api/v1/admin/seo` plus public page/product/blog APIs | Connected for record-level title, description, keywords, canonical URL, robots, and social image; global defaults remain config-owned |
| Export-market content | Export Markets | `ExportCountry` | public list and protected admin CRUD APIs | Connected with public fallback |
| Quality-page certifications | Certifications | `Certification` | public active list, protected CRUD, Cloudinary image upload/removal | Connected; section remains hidden when no verified records are published |
| Testimonials | Testimonials | `Testimonial` | public/admin testimonial APIs | Connected with homepage fallback |
| Customization images/options | Future typed Pages/Media | `WebsitePage`, `MediaAsset` candidates | copy contract exists; media/options contract missing | Partial |
| Product variants | Future Product Variants | Not modeled | Not implemented | Deferred/hidden |
| Catalog PDFs | Future Catalogs | Not modeled | Not implemented | Deferred/hidden |
| Quotations/PDF | Future Quotations | Not modeled | Not implemented | Deferred/hidden |
| Admin notifications/activity | Future System | Not modeled | Not implemented | Deferred/hidden |
| Visitor reporting | Future Analytics | `VisitorAnalytics` | tracking/dashboard pieces exist | Partial; keep hidden until verified |

## Ownership Rules

1. Database content edited in admin is the intended primary business-data source.
2. Local product/blog modules remain read-only resilience fallbacks during migration; do not edit both as independent sources.
3. Public visual layout, animation, responsive behavior, and component structure remain code-owned.
4. Admin may edit validated business content and media references, never arbitrary JSX, CSS, scripts, or unsafe HTML.
5. Unsupported modules are omitted from navigation and routing until model, API, authorization, UI, and tests exist.

## Next Connections

1. Expand typed WebsitePage schemas section by section while preserving current public layouts.
2. Continue replacing deep code-owned page copy with typed WebsitePage fields.
3. Add media reference tracking before enabling destructive central-media actions.
4. Remove local product/blog fallbacks only after production data completeness is verified.
5. Add a formal quotation model and document workflow on top of the connected Customer and Inquiry records.

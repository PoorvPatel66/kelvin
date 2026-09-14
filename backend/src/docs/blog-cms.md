# Kelvin Eco Products Enterprise Blog CMS

## Scope

The Blog CMS supports:

- Create blog
- Edit blog
- Soft delete blog
- Publish blog
- Draft blog
- Featured blog
- SEO metadata
- Blog categories
- Tags
- Slug generation
- Thumbnail upload
- Markdown content
- Rich text content
- Related articles
- Search
- Pagination
- Status management

## Prisma Models

```text
BlogCategory 1:N Blog
Admin        1:N Blog
Blog         N:N Blog through BlogRelatedArticle
```

Important fields:

```text
title
slug
excerpt
content
contentFormat
thumbnail
thumbnailPublicId
coverImage
coverImagePublicId
featured
status
published
publishedAt
seoTitle
seoDescription
seoKeywords
canonicalUrl
metaRobots
tags
isDeleted
deletedAt
categoryId
adminId
```

## Public Routes

```text
GET /blogs
GET /blogs/categories
GET /blogs/:slug
```

Versioned:

```text
GET /api/v1/blogs
GET /api/v1/blogs/categories
GET /api/v1/blogs/:slug
```

## Admin Routes

```text
GET    /admin/blogs
POST   /admin/blogs
GET    /admin/blogs/:id
PUT    /admin/blogs/:id
DELETE /admin/blogs/:id
PATCH  /admin/blogs/:id/status
PATCH  /admin/blogs/:id/publish
PATCH  /admin/blogs/:id/draft
PATCH  /admin/blogs/:id/featured
PUT    /admin/blogs/:id/related

GET    /admin/blogs/meta/categories
POST   /admin/blogs/meta/categories
PUT    /admin/blogs/meta/categories/:id
DELETE /admin/blogs/meta/categories/:id
```

Versioned:

```text
/api/v1/admin/blogs
```

## Search and Pagination

```text
GET /blogs?search=packaging&page=1&limit=10
```

Filters:

```text
GET /blogs?category=sustainability
GET /blogs?tag=export
GET /blogs?featured=true
GET /admin/blogs?status=DRAFT
```

Response:

```json
{
  "success": true,
  "currentPage": 1,
  "totalPages": 2,
  "totalBlogs": 12,
  "blogs": []
}
```

## Create Blog

```text
POST /admin/blogs
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

Fields:

```text
title
slug
excerpt
content
contentFormat=MARKDOWN | RICH_TEXT
status=DRAFT | PUBLISHED | ARCHIVED
featured=true | false
categoryId
tags=eco,packaging,b2b
seoTitle
seoDescription
seoKeywords=paper cups,food packaging
canonicalUrl
metaRobots
thumbnail=<image file>
```

If `slug` is omitted, the backend generates one from `title`.

## Publish and Draft

Publish:

```text
PATCH /admin/blogs/:id/publish
```

Draft:

```text
PATCH /admin/blogs/:id/draft
```

Generic status:

```text
PATCH /admin/blogs/:id/status
```

```json
{
  "status": "PUBLISHED"
}
```

## Related Articles

```text
PUT /admin/blogs/:id/related
```

```json
{
  "relatedIds": [
    "00000000-0000-0000-0000-000000000000"
  ]
}
```

The CMS stores relationships in `BlogRelatedArticle`.

## Security

All admin routes use:

```text
protect
authorize("SUPER_ADMIN", "ADMIN")
```

Public routes only return:

```text
status=PUBLISHED
published=true
isDeleted=false
```

## Swagger

```text
GET /api/docs
GET /api/docs/json
```

Blog endpoints are under:

```text
Blogs
Admin Blog CMS
```

## Line-by-Line Implementation Notes

`BlogStatus` controls `DRAFT`, `PUBLISHED`, and `ARCHIVED` states.

`BlogContentFormat` separates `MARKDOWN` from `RICH_TEXT`.

`BlogCategory` stores CMS blog categories independently from product categories.

`BlogRelatedArticle` stores self-referencing related articles without denormalizing IDs.

`generateSlug` converts titles to lowercase, hyphen-separated SEO slugs.

`parseStringArray` accepts either arrays or comma-separated strings for tags and SEO keywords.

`getPagination` converts query params into Prisma `skip` and `take`.

`getPublishedFields` keeps `status`, `published`, and `publishedAt` synchronized.

`includeBlogRelations` centralizes Prisma includes for admin, category, and related articles.

`buildPublicWhere` ensures public users only see published, non-deleted blogs.

`buildAdminWhere` allows admins to search drafts, published posts, archived posts, tags, categories, and featured blogs.

`buildBlogImageData` uploads thumbnail images to Cloudinary and stores URL plus public ID.

`createBlog` creates a blog with SEO metadata, content format, tags, category, featured state, and thumbnail.

`updateBlog` edits all CMS fields and can replace the thumbnail.

`deleteBlog` soft deletes by setting `isDeleted`, `deletedAt`, `ARCHIVED`, and `published=false`.

`publishBlog` sets `PUBLISHED`, `published=true`, and `publishedAt`.

`draftBlog` sets `DRAFT`, `published=false`, and clears `publishedAt`.

`setFeaturedBlog` toggles homepage/editorial featuring.

`setRelatedArticles` replaces the related article set in a transaction.

`createBlogCategory`, `updateBlogCategory`, and `deleteBlogCategory` manage CMS categories.

## Production Notes

- Run `npx prisma migrate dev --name enterprise-blog-cms` locally.
- Run `npx prisma migrate deploy` in production.
- Run `npx prisma generate` after migration.
- Store rich text as sanitized HTML or structured JSON from the editor.
- Sanitize rendered HTML on the frontend before display.
- Keep admin routes protected by JWT.
- Use duplicate slug handling from global Prisma error middleware.

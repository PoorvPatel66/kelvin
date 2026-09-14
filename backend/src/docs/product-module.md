# Kelvin Eco Products Product Management Module

## Folder Structure

```text
src/
|-- controllers/
|   |-- productController.js
|   `-- categoryController.js
|-- routes/
|   |-- productRoutes.js
|   `-- categoryRoutes.js
|-- middleware/
|   |-- authMiddleware.js
|   |-- uploadMiddleware.js
|   |-- errorMiddleware.js
|   `-- validateRequest.js
|-- services/
|   `-- cloudinaryService.js
|-- validators/
|   |-- productValidators.js
|   `-- categoryValidators.js
|-- docs/
|   |-- swagger.js
|   `-- product-module.md
|-- utils/
|   |-- AppError.js
|   `-- asyncHandler.js
```

## API Routes

Public:

```text
GET /products
GET /products/featured
GET /products/:slug
GET /categories
```

Versioned public:

```text
GET /api/v1/products
GET /api/v1/products/featured
GET /api/v1/products/:slug
GET /api/v1/categories
```

Admin:

```text
POST /admin/products
GET /admin/products
PUT /admin/products/:id
DELETE /admin/products/:id
POST /admin/categories
GET /admin/categories
PUT /admin/categories/:id
DELETE /admin/categories/:id
```

Versioned admin:

```text
/api/v1/admin/products
/api/v1/admin/categories
```

All admin routes require:

```text
Authorization: Bearer <JWT>
```

Allowed roles:

```text
SUPER_ADMIN
ADMIN
```

## Prisma Relationships

```text
Category 1:N Product
Product  1:N ProductImage
```

`Category.products` exposes all products belonging to a category.

`Product.categoryId` stores the foreign key.

`Product.images` exposes all uploaded images.

`ProductImage.productId` stores the foreign key and cascades when a product is deleted permanently.

## Product Fields

```text
name
slug
shortDescription
description
material
sizes
capacity
moq
specifications
usage
status
featured
categoryId
isDeleted
deletedAt
```

`isDeleted` and `deletedAt` implement soft delete.

## Search, Filter, Pagination

Search:

```text
GET /products?search=paper
```

Search checks product `name`, product `slug`, category `name`, and category `slug`.

Filter by category:

```text
GET /products?category=paper-packaging
GET /products?categoryId=<uuid>
```

Filter by featured:

```text
GET /products?featured=true
```

Filter by status:

```text
GET /admin/products?status=DRAFT
```

Pagination:

```text
GET /products?page=1&limit=10
```

Response:

```json
{
  "success": true,
  "currentPage": 1,
  "totalPages": 3,
  "totalProducts": 25,
  "products": []
}
```

## Multiple Image Upload

Create product with multipart form-data:

```text
POST /admin/products
```

Fields:

```text
name
slug
shortDescription
description
material
sizes
capacity
moq
specifications
usage
status
featured
categoryId
images
```

`images` supports up to 10 files.

Cloudinary stores the files.

PostgreSQL stores:

```text
url
publicId
productId
```

## Error Handling

Duplicate slug:

```json
{
  "success": false,
  "message": "Duplicate value for slug."
}
```

Invalid category:

```json
{
  "success": false,
  "message": "Invalid category."
}
```

Cloudinary failure:

```json
{
  "success": false,
  "message": "Cloudinary upload failed: <reason>"
}
```

## Swagger

Swagger UI:

```text
GET /api/docs
```

Swagger JSON:

```text
GET /api/docs/json
```

## Postman / Thunder Client Testing

1. Login as admin.
2. Copy the JWT token.
3. Add header:

```text
Authorization: Bearer <token>
```

4. Create category:

```text
POST /admin/categories
Content-Type: application/json
```

```json
{
  "name": "Paper Packaging",
  "slug": "paper-packaging",
  "description": "Eco-friendly paper packaging products.",
  "status": "ACTIVE"
}
```

5. Create product:

```text
POST /admin/products
Content-Type: multipart/form-data
```

6. Update product:

```text
PUT /admin/products/:id
```

7. Soft delete product:

```text
DELETE /admin/products/:id
```

8. Featured products:

```text
GET /products/featured
```

9. Search:

```text
GET /products?search=cup
```

10. Filter:

```text
GET /products?category=paper-packaging&featured=true
```

11. Pagination:

```text
GET /products?page=1&limit=10
```

## Line-by-Line Implementation Notes

`productController.js` imports `ProductStatus` to avoid hardcoded product states.

`prisma` is the generated Prisma Client used for PostgreSQL queries.

`AppError` creates operational errors with HTTP status codes.

`asyncHandler` forwards rejected promises to Express error middleware.

`uploadBufferToCloudinary` uploads Multer memory buffers to Cloudinary.

`parseJson` converts multipart string JSON into Prisma `Json` values.

`parseStringArray` accepts arrays or comma-separated strings for product sizes.

`parseBoolean` normalizes string booleans from multipart forms.

`getPagination` converts `page` and `limit` query strings into `skip` and `take`.

`buildProductWhere` builds a Prisma `where` object for search and filtering.

`assertCategoryExists` prevents products from being assigned to missing or deleted categories.

`uploadProductImages` enforces the 10-image limit and uploads files to Cloudinary.

`getProducts` returns public active, non-deleted products with pagination.

`getAdminProducts` returns products for admin management, including draft and inactive filters.

`getFeaturedProducts` returns only active, featured, non-deleted products and limits results to 6.

`getProductBySlug` returns one active public product by SEO slug.

`createProduct` validates category, uploads images, and creates product plus images in one Prisma write.

`updateProduct` updates allowed product fields and appends newly uploaded images.

`deleteProduct` soft deletes using `isDeleted`, `deletedAt`, and `INACTIVE` status.

`categoryController.js` mirrors category CRUD.

`deleteCategory` blocks deletion when active products still reference the category.

`productValidators.js` validates product payloads, IDs, slugs, status, featured, and pagination.

`categoryValidators.js` validates category payloads, IDs, slugs, and status.

`productRoutes.js` separates public product routes from exported admin routes.

`categoryRoutes.js` separates public category routes from exported admin routes.

`server.js` mounts public and admin routers at versioned and short paths.

## Production Notes

- Run `npx prisma migrate dev --name product-management-module` locally.
- Run `npx prisma migrate deploy` in production.
- Run `npx prisma generate` after schema changes.
- Set Cloudinary credentials in production.
- Keep admin APIs behind JWT authorization.
- Use HTTPS in production so cookies and uploads remain secure.
- Put API behind a reverse proxy or platform firewall.
- Add request body size limits based on expected upload sizes.

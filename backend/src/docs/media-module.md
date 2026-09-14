# Kelvin Eco Products Media Management System

## Step 1: Install Packages

```bash
npm install cloudinary
npm install multer
npm install multer-storage-cloudinary
```

`cloudinary` is the official SDK used to upload, transform, replace, and delete images.

`multer` parses `multipart/form-data` requests and gives Express access to uploaded files.

`multer-storage-cloudinary` is available when you want direct Cloudinary storage engines. This implementation uses Multer memory storage plus the Cloudinary SDK so uploads can be validated and transformed consistently before persistence.

## Step 2: Cloudinary Configuration

File:

```text
src/config/cloudinary.js
```

Environment:

```env
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
```

`CLOUDINARY_NAME` identifies the Cloudinary account.

`CLOUDINARY_API_KEY` identifies the API client.

`CLOUDINARY_SECRET` signs secure upload/delete requests and must never be exposed to the frontend.

## Step 3: Multer Setup

File:

```text
src/middleware/uploadMiddleware.js
src/middlewares/upload.js
```

Exports:

```text
singleImageUpload(fieldName)
multipleImageUpload(fieldName, maxCount)
upload
```

The middleware uses memory storage because Cloudinary receives the validated file buffer directly.

## Step 4: Validation

Allowed:

```text
jpg
jpeg
png
webp
svg
```

Rejected:

```text
exe
zip
pdf
```

Max size:

```text
5MB
```

Invalid files throw a centralized `AppError`.

## Step 5: Folder Strategy

```text
kelvin/products
kelvin/blogs
kelvin/certificates
kelvin/banners
kelvin/countries
kelvin/about
kelvin/downloads
```

## Step 6: Product Upload

```text
POST /admin/product/upload
POST /api/v1/admin/product/upload
```

Form-data:

```text
productId=<uuid>
images=<up to 10 image files>
```

Stores in PostgreSQL:

```text
ProductImage.url
ProductImage.publicId
ProductImage.productId
```

## Step 7: Blog Upload

```text
POST /admin/blog/upload
```

Form-data:

```text
blogId=<uuid>
imageType=thumbnail | cover
image=<file>
```

Stores:

```text
Blog.thumbnail
Blog.thumbnailPublicId
Blog.coverImage
Blog.coverImagePublicId
```

## Step 8: Hero Banner Upload

```text
POST /admin/banners/upload
```

Form-data:

```text
title=Homepage Banner
alt=Eco packaging banner
images=<multiple files>
```

Stores in:

```text
MediaAsset
```

## Step 9: Delete Images

Delete product image:

```text
DELETE /admin/product-images/:id
```

Delete generic media asset:

```text
DELETE /admin/assets/:id
```

Delete blog image:

```text
DELETE /admin/blog/:id/image/thumbnail
DELETE /admin/blog/:id/image/cover
```

Delete country flag:

```text
DELETE /admin/countries/:id/flag
```

Delete certificate icon:

```text
DELETE /admin/certificates/:id/icon
```

Deletion removes the image from Cloudinary first, then removes the database record.

## Step 10: Update Images

Replace product image:

```text
PUT /admin/product-images/:id
```

Replace media asset:

```text
PUT /admin/assets/:id
```

The new image uploads first. After successful upload, the old Cloudinary image is deleted and PostgreSQL is updated.

## Step 11: Optimization

Uploads use:

```text
quality=auto
fetch_format=auto
```

Cloudinary automatically compresses images and serves efficient formats where supported.

## Step 12: Transformations

Every upload response includes:

```json
{
  "thumbnail": "160x160 cropped image URL",
  "card": "640x480 cropped image URL",
  "large": "1400px limited image URL"
}
```

## Step 13: Security

All media routes use:

```text
protect
authorize("SUPER_ADMIN", "ADMIN")
```

JWT can be supplied through:

```text
Authorization: Bearer <token>
```

## Step 14: Error Handling

Wrong format:

```json
{
  "success": false,
  "message": "Only JPG, JPEG, PNG, WEBP, and SVG images are allowed."
}
```

Large image:

```json
{
  "success": false,
  "message": "File too large"
}
```

Cloudinary failure:

```json
{
  "success": false,
  "message": "Cloudinary upload failed: <reason>"
}
```

## Step 15: Swagger

Swagger UI:

```text
GET /api/docs
```

Media examples are under the `Admin Media` tag.

## Line-by-Line Implementation Notes

`cloudinary.js` imports Cloudinary SDK and configures credentials from environment variables.

`uploadMiddleware.js` imports Multer and `AppError`.

`allowedTypes` lists accepted image MIME types.

`maxSize` sets the 5MB upload limit.

`multer.memoryStorage()` keeps the file in memory for immediate Cloudinary upload.

`fileFilter` rejects unsupported MIME types before controller logic runs.

`singleImageUpload` wraps `upload.single`.

`multipleImageUpload` wraps `upload.array` and supports max counts such as 10 product images.

`cloudinaryService.js` validates configuration before using the SDK.

`uploadBufferToCloudinary` converts the buffer to a Data URI and uploads to Cloudinary.

`deleteFromCloudinary` removes the asset using `publicId`.

`replaceCloudinaryImage` uploads the replacement first, then deletes the old image.

`getImageTransformations` generates thumbnail, card, and large image URLs.

`mediaController.js` checks ownership records, uploads images, stores URLs/public IDs in Prisma, and returns transformation URLs.

`mediaRoutes.js` protects every route with JWT and role authorization.

`mediaValidators.js` validates UUID params, product IDs, blog IDs, and media asset types.

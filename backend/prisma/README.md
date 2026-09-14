# Kelvin Eco Products Prisma Database Layer

## Step 1: Initialize Prisma

Install Prisma CLI:

```bash
npm install prisma --save-dev
```

This installs the Prisma command line tool used to initialize Prisma, create migrations, validate the schema, and open Prisma Studio.

Install Prisma Client:

```bash
npm install @prisma/client
```

This installs the generated database client used by the Node.js application to query PostgreSQL safely.

Initialize Prisma:

```bash
npx prisma init
```

This creates the `prisma/` folder, `schema.prisma`, and a `.env` entry point for `DATABASE_URL`.

## Step 2: Configure Environment

Local PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kelvin_eco_products?schema=public"
```

Production PostgreSQL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public&sslmode=require"
```

Local setup usually points to a local PostgreSQL server or Docker container. Production setup should use a managed PostgreSQL provider with SSL enabled, private credentials, automated backups, and restricted network access.

## Step 3: Prisma Schema

The implemented schema is in:

```text
backend/prisma/schema.prisma
```

It defines:

- `Admin`
- `Category`
- `Product`
- `ProductImage`
- `Blog`
- `Inquiry`
- `ExportCountry`
- `Certification`

## Step 4: Enums

Implemented enums:

```prisma
enum Role {
  SUPER_ADMIN
  ADMIN
}

enum InquiryStatus {
  NEW
  OPEN
  REPLIED
  CLOSED
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  DRAFT
}
```

`Role` controls admin authorization. `InquiryStatus` tracks lead handling. `ProductStatus` controls catalog visibility.

## Step 5: Migration Commands

Create a development migration:

```bash
npx prisma migrate dev --name init
```

This reads `schema.prisma`, creates SQL migration files, applies them to the local PostgreSQL database, and regenerates Prisma Client.

Generate Prisma Client:

```bash
npx prisma generate
```

This rebuilds `@prisma/client` so application code can use the latest models and enums.

Production migration:

```bash
npx prisma migrate deploy
```

This applies committed migration files in production without creating new development migrations.

## Step 6: Seed Script

Seed file:

```text
backend/prisma/seed.js
```

Run seed:

```bash
npm run seed
```

Default admin:

```text
email: admin@kelvinecoproducts.com
password: Kelvin@1812
role: SUPER_ADMIN
```

Change this password immediately after first login in production.

## Step 7: Index Strategy

Optimized fields:

- `Admin.email` uses `@unique` for login lookup.
- `Category.slug` uses `@unique` for SEO-friendly category URLs.
- `Product.slug` uses `@unique` for SEO-friendly product URLs.
- `Product.categoryId` uses `@@index` for category product listing.
- `Product.featured` uses `@@index` for homepage featured product queries.
- `Product.categoryId + featured` uses a compound index for featured products inside a category.
- `Blog.slug` uses `@unique` for single blog pages.
- `Inquiry.email`, `Inquiry.status`, and `Inquiry.createdAt` use indexes for admin filtering.
- `ExportCountry.countryName` and `Certification.title` are unique to make seeding idempotent.

## Step 8: ERD Format

```text
Admin
|
|-- Blog

Category
|
|-- Product
    |
    |-- ProductImage

Inquiry

ExportCountry

Certification
```

Relationship detail:

- One `Category` has many `Product` records.
- One `Product` has many `ProductImage` records.
- One `Admin` can author many `Blog` records.
- `Inquiry` is standalone because it represents a lead.
- `ExportCountry` is standalone content for the export section.
- `Certification` is standalone trust-building content.

## Folder Structure

```text
backend/
|-- prisma/
|   |-- schema.prisma
|   |-- seed.js
|   `-- README.md
|-- src/
|   `-- config/
|       `-- prisma.js
|-- .env.example
`-- package.json
```

## Line-Level Code Explanation

`generator client` tells Prisma to generate the JavaScript client.

`datasource db` tells Prisma to use PostgreSQL and read the connection string from `DATABASE_URL`.

`@id` marks a primary key.

`@default(uuid())` generates UUID primary keys.

`@db.Uuid` stores IDs as native PostgreSQL UUID values.

`@unique` creates a unique database constraint.

`@default(now())` stores the creation timestamp automatically.

`@updatedAt` updates the timestamp whenever a row changes.

`Json?` stores flexible product specifications.

`String[]` stores PostgreSQL text arrays for product sizes.

`@relation(fields: [categoryId], references: [id])` connects a foreign key to a parent table.

`onDelete: Restrict` prevents deleting a category while products still use it.

`onDelete: Cascade` deletes product images when their product is deleted.

`onDelete: SetNull` keeps blog posts if the author admin is deleted.

`@@index` creates query indexes.

`@@map` maps Prisma model names to snake_case SQL table names.

In `seed.js`, `PrismaClient` opens database access, `bcrypt.hash` secures the admin password, `upsert` creates or updates known rows safely, `createMany` inserts bulk rows, and `$disconnect` closes the database connection.

## Best Practices

- Never commit `.env`.
- Use UUID primary keys for public-safe identifiers.
- Keep slugs unique for SEO routes.
- Store admin passwords only as bcrypt hashes.
- Keep product images in Cloudinary and store only URLs/public IDs in PostgreSQL.
- Use migrations as the source of truth in production.
- Use Prisma Client from a single shared module such as `src/config/prisma.js`.
- Avoid raw SQL unless needed for advanced reporting or performance tuning.

## Security Recommendations

- Use strong `JWT_SECRET`.
- Rotate production credentials regularly.
- Use SSL for production PostgreSQL.
- Restrict database access by IP or private network.
- Use least-privilege database users.
- Never expose Prisma errors directly to clients.
- Validate request bodies before writing to the database.
- Rate limit login and inquiry endpoints.
- Change the seeded admin password immediately.

## Production-Ready Commands

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run seed
npm start
```

Use `migrate deploy` in production, not `migrate dev`.

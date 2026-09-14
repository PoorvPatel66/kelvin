-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('LEAD', 'ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "CustomerSource" AS ENUM ('CONTACT', 'REQUEST_QUOTE', 'NEWSLETTER', 'BROCHURE_DOWNLOAD', 'WHATSAPP', 'MANUAL');

-- AlterTable
ALTER TABLE "inquiries" ADD COLUMN     "customerId" UUID;

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'LEAD',
    "source" "CustomerSource" NOT NULL DEFAULT 'MANUAL',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_notes" (
    "id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "adminId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_notes_pkey" PRIMARY KEY ("id")
);

-- Backfill one customer profile per existing inquiry email before linking history.
INSERT INTO "customers" (
    "id",
    "name",
    "company",
    "email",
    "phone",
    "country",
    "status",
    "source",
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid(),
    source_inquiry."name",
    source_inquiry."company",
    LOWER(source_inquiry."email"),
    source_inquiry."phone",
    source_inquiry."country",
    'LEAD'::"CustomerStatus",
    source_inquiry."type"::TEXT::"CustomerSource",
    source_inquiry."createdAt",
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT ON (LOWER("email"))
        "name",
        "company",
        "email",
        "phone",
        "country",
        "type",
        "createdAt"
    FROM "inquiries"
    WHERE "email" IS NOT NULL AND BTRIM("email") <> ''
    ORDER BY LOWER("email"), "createdAt" DESC
) AS source_inquiry;

UPDATE "inquiries" AS inquiry
SET "customerId" = customer."id"
FROM "customers" AS customer
WHERE LOWER(inquiry."email") = customer."email";

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "customers"("status");

-- CreateIndex
CREATE INDEX "customers_source_idx" ON "customers"("source");

-- CreateIndex
CREATE INDEX "customers_country_idx" ON "customers"("country");

-- CreateIndex
CREATE INDEX "customers_company_idx" ON "customers"("company");

-- CreateIndex
CREATE INDEX "customers_isDeleted_idx" ON "customers"("isDeleted");

-- CreateIndex
CREATE INDEX "customers_createdAt_idx" ON "customers"("createdAt");

-- CreateIndex
CREATE INDEX "customer_notes_customerId_idx" ON "customer_notes"("customerId");

-- CreateIndex
CREATE INDEX "customer_notes_adminId_idx" ON "customer_notes"("adminId");

-- CreateIndex
CREATE INDEX "inquiries_customerId_idx" ON "inquiries"("customerId");

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "website_pages" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "pageKey" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "excerpt" TEXT,
    "content" TEXT,
    "sections" JSONB,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "website_pages_slug_key" ON "website_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "website_pages_pageKey_key" ON "website_pages"("pageKey");

-- CreateIndex
CREATE INDEX "website_pages_status_idx" ON "website_pages"("status");

-- CreateIndex
CREATE INDEX "website_pages_slug_idx" ON "website_pages"("slug");

-- CreateIndex
CREATE INDEX "website_pages_pageKey_idx" ON "website_pages"("pageKey");

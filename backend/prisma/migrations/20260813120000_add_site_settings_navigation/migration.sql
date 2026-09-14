-- CreateEnum
CREATE TYPE "NavigationArea" AS ENUM ('HEADER', 'FOOTER_QUICK', 'FOOTER_MORE', 'FOOTER_SERVICES');

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'primary',
    "siteName" TEXT NOT NULL DEFAULT 'Kelvin Eco Products',
    "tagline" TEXT NOT NULL DEFAULT 'Think Green. Pack Smart.',
    "logoUrl" TEXT,
    "footerDescription" TEXT,
    "primaryPhone" TEXT,
    "alternatePhone" TEXT,
    "primaryEmail" TEXT,
    "alternateEmail" TEXT,
    "websiteUrl" TEXT,
    "whatsappNumber" TEXT,
    "headOffice" TEXT,
    "corporateOffice" TEXT,
    "businessHours" TEXT,
    "socialLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_items" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "area" "NavigationArea" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "navigation_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "navigation_items_area_path_key" ON "navigation_items"("area", "path");
CREATE INDEX "navigation_items_area_isVisible_sortOrder_idx" ON "navigation_items"("area", "isVisible", "sortOrder");

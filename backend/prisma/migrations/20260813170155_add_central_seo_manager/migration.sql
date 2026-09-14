-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "ogImage" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "metaRobots" TEXT,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "seoTitle" TEXT;

-- AlterTable
ALTER TABLE "website_pages" ADD COLUMN     "metaRobots" TEXT,
ADD COLUMN     "seoKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];

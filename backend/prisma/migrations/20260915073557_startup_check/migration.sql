-- AlterEnum
ALTER TYPE "BlogStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "parentId" UUID,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "blogs_scheduledAt_idx" ON "blogs"("scheduledAt");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE INDEX "categories_sortOrder_idx" ON "categories"("sortOrder");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "admin_verification_challenges_target_type_consumedAt_expiresAt_" RENAME TO "admin_verification_challenges_target_type_consumedAt_expire_idx";

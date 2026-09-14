ALTER TABLE "certifications"
ADD COLUMN "issuer" TEXT,
ADD COLUMN "certificateNumber" TEXT,
ADD COLUMN "issueDate" TIMESTAMP(3),
ADD COLUMN "expiryDate" TIMESTAMP(3),
ADD COLUMN "pdfUrl" TEXT,
ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "certifications_status_idx" ON "certifications"("status");
CREATE INDEX "certifications_isDeleted_idx" ON "certifications"("isDeleted");
CREATE INDEX "certifications_sortOrder_idx" ON "certifications"("sortOrder");

-- AlterTable
ALTER TABLE "admins"
ADD COLUMN "mobile" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "admin_otp_challenges" (
    "id" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "mobile" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "resendAvailableAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_mobile_key" ON "admins"("mobile");
CREATE INDEX "admins_isActive_idx" ON "admins"("isActive");
CREATE INDEX "admin_otp_challenges_adminId_createdAt_idx" ON "admin_otp_challenges"("adminId", "createdAt");
CREATE INDEX "admin_otp_challenges_mobile_consumedAt_expiresAt_idx" ON "admin_otp_challenges"("mobile", "consumedAt", "expiresAt");

-- AddForeignKey
ALTER TABLE "admin_otp_challenges"
ADD CONSTRAINT "admin_otp_challenges_adminId_fkey"
FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

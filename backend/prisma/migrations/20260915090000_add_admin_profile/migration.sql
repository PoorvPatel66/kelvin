ALTER TABLE "admins"
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TYPE "AdminVerificationType" AS ENUM ('EMAIL', 'PHONE');

CREATE TABLE "admin_verification_challenges" (
    "id" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "type" "AdminVerificationType" NOT NULL,
    "target" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "resendAvailableAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_verification_challenges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_verification_challenges_adminId_type_createdAt_idx"
ON "admin_verification_challenges"("adminId", "type", "createdAt");
CREATE INDEX "admin_verification_challenges_target_type_consumedAt_expiresAt_idx"
ON "admin_verification_challenges"("target", "type", "consumedAt", "expiresAt");

ALTER TABLE "admin_verification_challenges"
ADD CONSTRAINT "admin_verification_challenges_adminId_fkey"
FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
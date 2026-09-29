-- Splits the single dual-signature per-order Contract into two independent, symmetric
-- documents per order (one per ContractAudience: SPECIALIST, CLIENT). Contract is empty
-- in every environment reaching this migration, so no data-preserving transform is needed.

-- CreateEnum
CREATE TYPE "ContractAudience" AS ENUM ('SPECIALIST', 'CLIENT');

-- AlterEnum: recreate ContractStatus with the simplified per-audience states
ALTER TYPE "ContractStatus" RENAME TO "ContractStatus_old";
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SENT', 'SIGNED', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Contract" ALTER COLUMN "status" TYPE "ContractStatus" USING ("status"::text::"ContractStatus");
ALTER TABLE "Contract" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

DROP TYPE "ContractStatus_old";

ALTER TABLE "Contract"
  DROP COLUMN "specialistSignedS3Key",
  DROP COLUMN "clientSignedS3Key",
  DROP COLUMN "sentToSpecialistAt",
  DROP COLUMN "specialistSignedAt",
  DROP COLUMN "sentToClientAt",
  DROP COLUMN "clientSignedAt",
  ADD COLUMN "audience" "ContractAudience" NOT NULL,
  ADD COLUMN "signedS3Key" TEXT,
  ADD COLUMN "sentAt" TIMESTAMP(3),
  ADD COLUMN "signedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_orderId_audience_key" ON "Contract"("orderId", "audience");

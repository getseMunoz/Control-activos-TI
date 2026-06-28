-- AlterTable
ALTER TABLE "asset_assignments" ADD COLUMN     "delivery_signature_data" TEXT,
ADD COLUMN     "delivery_signed_at" TIMESTAMP(3),
ADD COLUMN     "delivery_signed_by_name" TEXT;

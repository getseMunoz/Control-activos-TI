-- AlterTable
ALTER TABLE "asset_assignments" ADD COLUMN     "return_requires_user_signature" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "return_user_signature_data" TEXT,
ADD COLUMN     "return_user_signed_at" TIMESTAMP(3),
ADD COLUMN     "return_user_signed_by_name" TEXT;

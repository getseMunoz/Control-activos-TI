-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "company_asset_number" TEXT,
ADD COLUMN     "company_model" TEXT,
ADD COLUMN     "inventory_tag" TEXT;

-- CreateTable
CREATE TABLE "asset_credentials" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "access_url" TEXT,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "asset_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asset_credentials_asset_id_idx" ON "asset_credentials"("asset_id");

-- AddForeignKey
ALTER TABLE "asset_credentials" ADD CONSTRAINT "asset_credentials_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_credentials" ADD CONSTRAINT "asset_credentials_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_credentials" ADD CONSTRAINT "asset_credentials_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_credentials" ADD CONSTRAINT "asset_credentials_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

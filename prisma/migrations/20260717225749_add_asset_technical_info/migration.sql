-- CreateTable
CREATE TABLE "asset_technical_info" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "hostname" TEXT,
    "mac_address_eth0" TEXT,
    "mac_address_wifi" TEXT,
    "ip_address" TEXT,
    "public_ip_address" TEXT,
    "operating_system" TEXT,
    "office_version" TEXT,
    "firmware_version" TEXT,
    "model_number" TEXT,
    "byod" BOOLEAN NOT NULL DEFAULT false,
    "requestable" BOOLEAN NOT NULL DEFAULT false,
    "order_number" TEXT,
    "additional_notes" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_technical_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_technical_info_asset_id_key" ON "asset_technical_info"("asset_id");

-- AddForeignKey
ALTER TABLE "asset_technical_info" ADD CONSTRAINT "asset_technical_info_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_technical_info" ADD CONSTRAINT "asset_technical_info_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_technical_info" ADD CONSTRAINT "asset_technical_info_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

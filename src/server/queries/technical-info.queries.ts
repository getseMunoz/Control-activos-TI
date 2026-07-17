import { prisma } from '@/lib/prisma'

export type AssetTechnicalInfoData = NonNullable<
  Awaited<ReturnType<typeof getTechnicalInfoByAssetId>>
>

export async function getTechnicalInfoByAssetId(assetId: string) {
  return prisma.assetTechnicalInfo.findUnique({
    where: { assetId },
    select: {
      id: true,
      hostname: true,
      macAddressEth0: true,
      macAddressWifi: true,
      ipAddress: true,
      publicIpAddress: true,
      operatingSystem: true,
      officeVersion: true,
      firmwareVersion: true,
      modelNumber: true,
      byod: true,
      requestable: true,
      orderNumber: true,
      additionalNotes: true,
      createdAt: true,
      updatedAt: true,
      createdByUser: { select: { firstName: true, lastName: true } },
      updatedByUser: { select: { firstName: true, lastName: true } },
    },
  })
}

import { prisma } from '@/lib/prisma'

export type AssetTypeListItem = Awaited<ReturnType<typeof getAssetTypes>>[number]
export type AssetTypeDetail = NonNullable<Awaited<ReturnType<typeof getAssetTypeById>>>

export async function getAssetTypes() {
  return prisma.assetType.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  })
}

export async function getAssetTypeById(id: string) {
  return prisma.assetType.findFirst({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
    },
  })
}

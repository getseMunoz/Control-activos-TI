import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

const assetListSelect = {
  id: true,
  internalCode: true,
  name: true,
  brand: true,
  model: true,
  serialNumber: true,
  partNumber: true,
  status: true,
  purchaseDate: true,
  deletedAt: true,
  assetType: { select: { name: true } },
  location: { select: { name: true } },
} satisfies Prisma.AssetSelect

export type AssetListItem = Prisma.AssetGetPayload<{ select: typeof assetListSelect }>

export async function getAssets(): Promise<AssetListItem[]> {
  return prisma.asset.findMany({
    select: assetListSelect,
    orderBy: { createdAt: 'desc' },
  })
}

const assetDetailSelect = {
  id: true,
  internalCode: true,
  name: true,
  brand: true,
  model: true,
  serialNumber: true,
  partNumber: true,
  status: true,
  purchaseDate: true,
  purchasePrice: true,
  notes: true,
  locationId: true,
  assetTypeId: true,
  deletedAt: true,
} satisfies Prisma.AssetSelect

export type AssetDetail = Prisma.AssetGetPayload<{ select: typeof assetDetailSelect }>

export async function getAssetById(id: string): Promise<AssetDetail | null> {
  return prisma.asset.findUnique({
    where: { id },
    select: assetDetailSelect,
  })
}

export async function getActiveAssetTypes() {
  return prisma.assetType.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export async function getActiveLocationsForAssets() {
  return prisma.location.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

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

const assetFullDetailSelect = {
  id: true,
  internalCode: true,
  name: true,
  serialNumber: true,
  brand: true,
  model: true,
  partNumber: true,
  status: true,
  purchaseDate: true,
  purchasePrice: true,
  supplierName: true,
  invoiceNumber: true,
  warrantyExpiryDate: true,
  usefulLifeYears: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  assetType: { select: { name: true } },
  location: { select: { name: true } },
  createdByUser: { select: { firstName: true, lastName: true } },
  updatedByUser: { select: { firstName: true, lastName: true } },
  assignments: {
    select: {
      id: true,
      assignedAt: true,
      returnedAt: true,
      notes: true,
      user: { select: { firstName: true, lastName: true, email: true } },
      assignedByUser: { select: { firstName: true, lastName: true } },
      returnedByUser: { select: { firstName: true, lastName: true } },
      deliveryLocation: { select: { name: true } },
    },
    orderBy: { assignedAt: 'desc' as const },
  },
  expenses: {
    select: {
      id: true,
      name: true,
      cost: true,
      purchaseDate: true,
      supplierName: true,
      invoiceNumber: true,
      notes: true,
      createdAt: true,
      createdByUser: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ purchaseDate: 'desc' as const }, { createdAt: 'desc' as const }],
  },
  incidents: {
    select: {
      id: true,
      incidentNumber: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      resolution: true,
      resolvedAt: true,
      createdAt: true,
      reportedByUser: { select: { firstName: true, lastName: true } },
      resolvedByUser: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ createdAt: 'desc' as const }],
  },
  maintenanceOrders: {
    select: {
      id: true,
      orderNumber: true,
      title: true,
      description: true,
      type: true,
      status: true,
      priority: true,
      scheduledDate: true,
      startedAt: true,
      completedAt: true,
      result: true,
      cost: true,
      createdAt: true,
      createdByUser: { select: { firstName: true, lastName: true } },
      assignedToUser: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ createdAt: 'desc' as const }],
  },
} satisfies Prisma.AssetSelect

export type AssetFullDetail = Prisma.AssetGetPayload<{ select: typeof assetFullDetailSelect }>

export async function getAssetDetailById(id: string): Promise<AssetFullDetail | null> {
  return prisma.asset.findUnique({
    where: { id },
    select: assetFullDetailSelect,
  })
}

export async function getAssetForExpenseById(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    select: { id: true, internalCode: true, name: true, serialNumber: true, deletedAt: true },
  })
}

export async function getAssetForMaintenanceById(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    select: {
      id: true,
      internalCode: true,
      name: true,
      serialNumber: true,
      status: true,
      deletedAt: true,
    },
  })
}

export async function getAssetForIncidentById(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    select: {
      id: true,
      internalCode: true,
      name: true,
      serialNumber: true,
      status: true,
      deletedAt: true,
    },
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

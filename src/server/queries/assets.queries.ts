import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

const VALID_STATUSES = [
  'in_storage',
  'assigned',
  'in_maintenance',
  'decommissioned',
  'stolen',
  'lost',
] as const
type AssetStatusValue = (typeof VALID_STATUSES)[number]
function isValidStatus(s: string): s is AssetStatusValue {
  return (VALID_STATUSES as readonly string[]).includes(s)
}

export type AssetListFilters = {
  q?: string
  status?: string
  assetTypeId?: string
  locationId?: string
  assigned?: 'assigned' | 'unassigned'
  hasAlerts?: 'yes' | 'no'
}

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
  purchasePrice: true,
  supplierName: true,
  invoiceNumber: true,
  warrantyExpiryDate: true,
  createdAt: true,
  deletedAt: true,
  assetType: { select: { name: true } },
  location: { select: { name: true } },
  assignments: {
    where: { returnedAt: null },
    take: 1,
    select: {
      assignedAt: true,
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  },
  incidents: {
    where: { status: { in: ['open', 'in_review', 'in_progress'] as const } },
    select: { id: true },
  },
  maintenanceOrders: {
    where: {
      status: { in: ['pending', 'in_progress', 'waiting_parts', 'waiting_supplier'] as const },
    },
    select: { id: true },
  },
  expenses: {
    select: { cost: true },
  },
} satisfies Prisma.AssetSelect

export type AssetListItem = Prisma.AssetGetPayload<{ select: typeof assetListSelect }>

export async function getAssets(filters: AssetListFilters = {}): Promise<AssetListItem[]> {
  const conditions: Prisma.AssetWhereInput[] = [{ deletedAt: null }]

  if (filters.q?.trim()) {
    const q = filters.q.trim()
    conditions.push({
      OR: [
        { internalCode: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { serialNumber: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
        { partNumber: { contains: q, mode: 'insensitive' } },
        {
          assignments: {
            some: {
              returnedAt: null,
              user: {
                OR: [
                  { firstName: { contains: q, mode: 'insensitive' } },
                  { lastName: { contains: q, mode: 'insensitive' } },
                  { email: { contains: q, mode: 'insensitive' } },
                ],
              },
            },
          },
        },
      ],
    })
  }

  if (filters.status && isValidStatus(filters.status)) {
    conditions.push({ status: filters.status })
  }

  if (filters.assetTypeId) {
    conditions.push({ assetTypeId: filters.assetTypeId })
  }

  if (filters.locationId) {
    conditions.push({ locationId: filters.locationId })
  }

  if (filters.assigned === 'assigned') {
    conditions.push({ assignments: { some: { returnedAt: null } } })
  } else if (filters.assigned === 'unassigned') {
    conditions.push({ assignments: { none: { returnedAt: null } } })
  }

  const openIncidentStatuses = ['open', 'in_review', 'in_progress'] as const
  const activeMaintenanceStatuses = [
    'pending',
    'in_progress',
    'waiting_parts',
    'waiting_supplier',
  ] as const

  if (filters.hasAlerts === 'yes') {
    conditions.push({
      OR: [
        { incidents: { some: { status: { in: [...openIncidentStatuses] } } } },
        { maintenanceOrders: { some: { status: { in: [...activeMaintenanceStatuses] } } } },
      ],
    })
  } else if (filters.hasAlerts === 'no') {
    conditions.push({ incidents: { none: { status: { in: [...openIncidentStatuses] } } } })
    conditions.push({
      maintenanceOrders: { none: { status: { in: [...activeMaintenanceStatuses] } } },
    })
  }

  const where: Prisma.AssetWhereInput =
    conditions.length === 1 ? conditions[0] : { AND: conditions }

  return prisma.asset.findMany({
    select: assetListSelect,
    where,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAssetFilterOptions() {
  const [assetTypes, locations] = await Promise.all([
    prisma.assetType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.location.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])
  return { assetTypes, locations }
}

const assetDetailSelect = {
  id: true,
  internalCode: true,
  name: true,
  brand: true,
  model: true,
  serialNumber: true,
  partNumber: true,
  companyAssetNumber: true,
  companyModel: true,
  inventoryTag: true,
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
  companyAssetNumber: true,
  companyModel: true,
  inventoryTag: true,
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
      deliverySignedAt: true,
      deliverySignedByName: true,
      returnSignedAt: true,
      returnSignedByName: true,
      user: {
        select: { firstName: true, lastName: true, email: true, position: true, role: true },
      },
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

export async function getMaintenanceOrderForEdit(assetId: string, orderId: string) {
  return prisma.maintenanceOrder.findFirst({
    where: { id: orderId, assetId },
    select: {
      id: true,
      assetId: true,
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
      asset: {
        select: {
          id: true,
          internalCode: true,
          name: true,
          serialNumber: true,
          status: true,
          deletedAt: true,
        },
      },
    },
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

export async function getIncidentForEdit(assetId: string, incidentId: string) {
  return prisma.incident.findFirst({
    where: { id: incidentId, assetId },
    select: {
      id: true,
      assetId: true,
      incidentNumber: true,
      title: true,
      description: true,
      priority: true,
      status: true,
      resolution: true,
      resolvedAt: true,
      createdAt: true,
      asset: {
        select: {
          id: true,
          internalCode: true,
          name: true,
          serialNumber: true,
          status: true,
          deletedAt: true,
        },
      },
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

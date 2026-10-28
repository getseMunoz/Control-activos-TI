import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(v: string | undefined): v is string {
  return Boolean(v && UUID_RE.test(v))
}

function isValidDate(v: string | undefined): v is string {
  return Boolean(v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)))
}

export type AssignmentListFilters = {
  q?: string
  status?: string
  userId?: string
  assetId?: string
  dateFrom?: string
  dateTo?: string
}

const VALID_ASSIGNMENT_STATUSES = [
  'active',
  'returned',
  'returned_with_signature',
  'returned_without_signature',
]

const assignmentListSelect = {
  id: true,
  assignedAt: true,
  returnedAt: true,
  deliverySignedAt: true,
  deliverySignedByName: true,
  returnSignedAt: true,
  returnSignedByName: true,
  returnRequiresUserSignature: true,
  returnUserSignedAt: true,
  notes: true,
  accessories: true,
  asset: { select: { id: true, internalCode: true, name: true, serialNumber: true } },
  user: {
    select: { id: true, firstName: true, lastName: true, email: true, position: true, role: true },
  },
  assignedByUser: { select: { firstName: true, lastName: true } },
  returnedByUser: { select: { firstName: true, lastName: true } },
  deliveryLocation: { select: { name: true } },
} satisfies Prisma.AssetAssignmentSelect

export type AssignmentListItem = Prisma.AssetAssignmentGetPayload<{
  select: typeof assignmentListSelect
}>

export async function getAssignments(
  rawFilters?: AssignmentListFilters,
): Promise<AssignmentListItem[]> {
  const filters: AssignmentListFilters = {
    q: rawFilters?.q?.trim() || undefined,
    status:
      rawFilters?.status && VALID_ASSIGNMENT_STATUSES.includes(rawFilters.status)
        ? rawFilters.status
        : undefined,
    userId: isUuid(rawFilters?.userId) ? rawFilters!.userId : undefined,
    assetId: isUuid(rawFilters?.assetId) ? rawFilters!.assetId : undefined,
    dateFrom: isValidDate(rawFilters?.dateFrom) ? rawFilters!.dateFrom : undefined,
    dateTo: isValidDate(rawFilters?.dateTo) ? rawFilters!.dateTo : undefined,
  }

  const where: Prisma.AssetAssignmentWhereInput = {}

  // Filter by status
  if (filters.status === 'active') {
    where.returnedAt = null
  } else if (filters.status === 'returned') {
    where.returnedAt = { not: null }
  } else if (filters.status === 'returned_with_signature') {
    where.returnedAt = { not: null }
    where.returnSignedAt = { not: null }
  } else if (filters.status === 'returned_without_signature') {
    where.returnedAt = { not: null }
    where.returnSignedAt = null
  }

  // Filter by userId
  if (filters.userId) {
    where.userId = filters.userId
  }

  // Filter by assetId
  if (filters.assetId) {
    where.assetId = filters.assetId
  }

  // Filter by assignedAt range
  if (filters.dateFrom || filters.dateTo) {
    where.assignedAt = {}
    if (filters.dateFrom) {
      where.assignedAt.gte = new Date(`${filters.dateFrom}T00:00:00.000Z`)
    }
    if (filters.dateTo) {
      where.assignedAt.lte = new Date(`${filters.dateTo}T23:59:59.999Z`)
    }
  }

  // Free-text search across asset and user fields
  if (filters.q) {
    const q = filters.q
    where.OR = [
      { asset: { internalCode: { contains: q, mode: 'insensitive' } } },
      { asset: { name: { contains: q, mode: 'insensitive' } } },
      { asset: { serialNumber: { contains: q, mode: 'insensitive' } } },
      { user: { firstName: { contains: q, mode: 'insensitive' } } },
      { user: { lastName: { contains: q, mode: 'insensitive' } } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
    ]
  }

  return prisma.assetAssignment.findMany({
    where,
    select: assignmentListSelect,
    orderBy: [{ assignedAt: 'desc' }],
  })
}

export async function getAssignmentFilterOptions() {
  const [users, assets] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    }),
    prisma.asset.findMany({
      where: { deletedAt: null },
      select: { id: true, internalCode: true, name: true },
      orderBy: { internalCode: 'asc' },
    }),
  ])
  return { users, assets }
}

const assignmentDetailSelect = {
  id: true,
  assetId: true,
  assignedAt: true,
  returnedAt: true,
  notes: true,
  accessories: true,
  asset: { select: { id: true, internalCode: true, name: true, serialNumber: true } },
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.AssetAssignmentSelect

export type AssignmentDetail = Prisma.AssetAssignmentGetPayload<{
  select: typeof assignmentDetailSelect
}>

export async function getAssignmentById(id: string): Promise<AssignmentDetail | null> {
  return prisma.assetAssignment.findUnique({
    where: { id },
    select: assignmentDetailSelect,
  })
}

export async function getAssignableAssets() {
  return prisma.asset.findMany({
    where: {
      status: 'in_storage',
      deletedAt: null,
      assignments: { none: { returnedAt: null } },
    },
    select: {
      id: true,
      internalCode: true,
      name: true,
      serialNumber: true,
      brand: true,
      model: true,
      assetType: { select: { name: true } },
    },
    orderBy: [{ assetType: { name: 'asc' } }, { name: 'asc' }],
  })
}

export async function getAssignableUsers() {
  return prisma.user.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, firstName: true, lastName: true, email: true, position: true, role: true },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })
}

export async function getDeliveryLocations() {
  return prisma.location.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

const assignmentReceiptSelect = {
  id: true,
  userId: true,
  assignedAt: true,
  deliverySignedAt: true,
  deliverySignedByName: true,
  deliverySignatureData: true,
  notes: true,
  accessories: true,
  asset: {
    select: {
      id: true,
      internalCode: true,
      name: true,
      serialNumber: true,
      brand: true,
      model: true,
      partNumber: true,
      status: true,
      assetType: { select: { name: true } },
      location: { select: { name: true } },
    },
  },
  user: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
      position: true,
      role: true,
    },
  },
  assignedByUser: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  deliveryLocation: { select: { name: true } },
} satisfies Prisma.AssetAssignmentSelect

export type AssignmentReceipt = Prisma.AssetAssignmentGetPayload<{
  select: typeof assignmentReceiptSelect
}>

export async function getAssignmentReceiptById(
  assignmentId: string,
): Promise<AssignmentReceipt | null> {
  return prisma.assetAssignment.findUnique({
    where: { id: assignmentId },
    select: assignmentReceiptSelect,
  })
}

const assignmentReturnReceiptSelect = {
  id: true,
  userId: true,
  assignedAt: true,
  returnedAt: true,
  returnSignedAt: true,
  returnSignedByName: true,
  returnSignatureData: true,
  returnUserSignatureData: true,
  returnUserSignedAt: true,
  returnUserSignedByName: true,
  returnRequiresUserSignature: true,
  notes: true,
  accessories: true,
  asset: {
    select: {
      id: true,
      internalCode: true,
      name: true,
      serialNumber: true,
      brand: true,
      model: true,
      partNumber: true,
      status: true,
      assetType: { select: { name: true } },
      location: { select: { name: true } },
    },
  },
  user: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
      position: true,
      role: true,
    },
  },
  assignedByUser: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  returnedByUser: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  deliveryLocation: { select: { name: true } },
} satisfies Prisma.AssetAssignmentSelect

export type AssignmentReturnReceipt = Prisma.AssetAssignmentGetPayload<{
  select: typeof assignmentReturnReceiptSelect
}>

export async function getAssignmentReturnReceiptById(
  assignmentId: string,
): Promise<AssignmentReturnReceipt | null> {
  return prisma.assetAssignment.findUnique({
    where: { id: assignmentId },
    select: assignmentReturnReceiptSelect,
  })
}

const assignmentSignSelect = {
  id: true,
  assignedAt: true,
  deliverySignedAt: true,
  asset: {
    select: {
      internalCode: true,
      name: true,
      serialNumber: true,
      brand: true,
      model: true,
      assetType: { select: { name: true } },
      location: { select: { name: true } },
    },
  },
} satisfies Prisma.AssetAssignmentSelect

export type AssignmentSignData = Prisma.AssetAssignmentGetPayload<{
  select: typeof assignmentSignSelect
}>

// Solo devuelve la asignación si pertenece al usuario, sigue activa y el activo no está archivado.
export async function getAssignmentForSigning(
  assignmentId: string,
  userId: string,
): Promise<AssignmentSignData | null> {
  return prisma.assetAssignment.findFirst({
    where: {
      id: assignmentId,
      userId,
      returnedAt: null,
      asset: { deletedAt: null },
    },
    select: assignmentSignSelect,
  })
}

const assignmentReturnSignSelect = {
  id: true,
  assignedAt: true,
  returnedAt: true,
  returnUserSignedAt: true,
  returnRequiresUserSignature: true,
  asset: {
    select: {
      internalCode: true,
      name: true,
      serialNumber: true,
      brand: true,
      model: true,
      assetType: { select: { name: true } },
      location: { select: { name: true } },
    },
  },
} satisfies Prisma.AssetAssignmentSelect

export type AssignmentReturnSignData = Prisma.AssetAssignmentGetPayload<{
  select: typeof assignmentReturnSignSelect
}>

// Solo devuelve la asignación si pertenece al usuario, ya fue devuelta y el activo no está archivado.
export async function getAssignmentForReturnSigning(
  assignmentId: string,
  userId: string,
): Promise<AssignmentReturnSignData | null> {
  return prisma.assetAssignment.findFirst({
    where: {
      id: assignmentId,
      userId,
      returnedAt: { not: null },
      asset: { deletedAt: null },
    },
    select: assignmentReturnSignSelect,
  })
}

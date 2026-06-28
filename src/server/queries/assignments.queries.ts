import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

const assignmentListSelect = {
  id: true,
  assignedAt: true,
  returnedAt: true,
  asset: { select: { internalCode: true, name: true, serialNumber: true } },
  user: { select: { firstName: true, lastName: true, email: true } },
  assignedByUser: { select: { firstName: true, lastName: true } },
  deliveryLocation: { select: { name: true } },
} satisfies Prisma.AssetAssignmentSelect

export type AssignmentListItem = Prisma.AssetAssignmentGetPayload<{
  select: typeof assignmentListSelect
}>

export async function getAssignments(): Promise<AssignmentListItem[]> {
  return prisma.assetAssignment.findMany({
    select: assignmentListSelect,
    orderBy: [{ returnedAt: { sort: 'asc', nulls: 'first' } }, { assignedAt: 'desc' }],
  })
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
    select: { id: true, firstName: true, lastName: true, email: true },
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

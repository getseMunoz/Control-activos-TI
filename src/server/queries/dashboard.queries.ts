import { prisma } from '@/lib/prisma'

export async function getDashboardSummary() {
  const [
    totalAssets,
    inStorageAssets,
    assignedAssets,
    inMaintenanceAssets,
    activeIncidents,
    activeMaintenanceOrders,
    expensesAggregate,
    recentAssets,
    recentIncidents,
    upcomingMaintenance,
  ] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, status: 'in_storage' } }),
    prisma.asset.count({ where: { deletedAt: null, status: 'assigned' } }),
    prisma.asset.count({ where: { deletedAt: null, status: 'in_maintenance' } }),
    prisma.incident.count({
      where: {
        status: { in: ['open', 'in_review', 'in_progress'] },
        asset: { deletedAt: null },
      },
    }),
    prisma.maintenanceOrder.count({
      where: {
        status: { in: ['pending', 'in_progress', 'waiting_parts', 'waiting_supplier'] },
        asset: { deletedAt: null },
      },
    }),
    prisma.assetExpense.aggregate({ _sum: { cost: true } }),
    prisma.asset.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        internalCode: true,
        name: true,
        serialNumber: true,
        status: true,
        createdAt: true,
        assetType: { select: { name: true } },
      },
    }),
    prisma.incident.findMany({
      where: {
        asset: { deletedAt: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        assetId: true,
        incidentNumber: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        asset: { select: { internalCode: true, name: true } },
      },
    }),
    prisma.maintenanceOrder.findMany({
      where: {
        status: { in: ['pending', 'in_progress', 'waiting_parts', 'waiting_supplier'] },
        asset: { deletedAt: null },
      },
      orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'desc' }],
      take: 5,
      select: {
        id: true,
        assetId: true,
        orderNumber: true,
        title: true,
        status: true,
        type: true,
        priority: true,
        scheduledDate: true,
        asset: { select: { internalCode: true, name: true } },
      },
    }),
  ])

  return {
    totalAssets,
    inStorageAssets,
    assignedAssets,
    inMaintenanceAssets,
    activeIncidents,
    activeMaintenanceOrders,
    totalExpenses: Number(expensesAggregate._sum.cost ?? 0),
    recentAssets,
    recentIncidents,
    upcomingMaintenance,
  }
}

export type DashboardSummary = Awaited<ReturnType<typeof getDashboardSummary>>

const OPEN_INCIDENT_STATUSES = ['open', 'in_review', 'in_progress'] as const
const ACTIVE_MAINTENANCE_STATUSES = [
  'pending',
  'in_progress',
  'waiting_parts',
  'waiting_supplier',
] as const

export async function getDashboardAlerts() {
  const [
    openIncidentsCount,
    openIncidents,
    activeMaintenanceCount,
    activeMaintenanceOrders,
    unsignedActiveAssignmentsCount,
    unsignedActiveAssignments,
    unsignedReturnAssignmentsCount,
    unsignedReturnAssignments,
    lostOrStolenAssetsCount,
    lostOrStolenAssets,
  ] = await Promise.all([
    prisma.incident.count({
      where: {
        status: { in: [...OPEN_INCIDENT_STATUSES] },
        asset: { deletedAt: null },
      },
    }),
    prisma.incident.findMany({
      where: {
        status: { in: [...OPEN_INCIDENT_STATUSES] },
        asset: { deletedAt: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        assetId: true,
        incidentNumber: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        asset: { select: { internalCode: true, name: true } },
        reportedByUser: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.maintenanceOrder.count({
      where: {
        status: { in: [...ACTIVE_MAINTENANCE_STATUSES] },
        asset: { deletedAt: null },
      },
    }),
    prisma.maintenanceOrder.findMany({
      where: {
        status: { in: [...ACTIVE_MAINTENANCE_STATUSES] },
        asset: { deletedAt: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        assetId: true,
        orderNumber: true,
        title: true,
        status: true,
        createdAt: true,
        asset: { select: { internalCode: true, name: true } },
      },
    }),
    prisma.assetAssignment.count({
      where: {
        returnedAt: null,
        deliverySignedAt: null,
        asset: { deletedAt: null },
      },
    }),
    prisma.assetAssignment.findMany({
      where: {
        returnedAt: null,
        deliverySignedAt: null,
        asset: { deletedAt: null },
      },
      orderBy: { assignedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        assignedAt: true,
        asset: { select: { id: true, internalCode: true, name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.assetAssignment.count({
      where: {
        returnedAt: { not: null },
        returnSignedAt: null,
        asset: { deletedAt: null },
      },
    }),
    prisma.assetAssignment.findMany({
      where: {
        returnedAt: { not: null },
        returnSignedAt: null,
        asset: { deletedAt: null },
      },
      orderBy: { returnedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        returnedAt: true,
        asset: { select: { id: true, internalCode: true, name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.asset.count({
      where: {
        deletedAt: null,
        status: { in: ['lost', 'stolen'] },
      },
    }),
    prisma.asset.findMany({
      where: {
        deletedAt: null,
        status: { in: ['lost', 'stolen'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        internalCode: true,
        name: true,
        status: true,
        createdAt: true,
        location: { select: { name: true } },
      },
    }),
  ])

  return {
    openIncidentsCount,
    openIncidents,
    activeMaintenanceCount,
    activeMaintenanceOrders,
    unsignedActiveAssignmentsCount,
    unsignedActiveAssignments,
    unsignedReturnAssignmentsCount,
    unsignedReturnAssignments,
    lostOrStolenAssetsCount,
    lostOrStolenAssets,
  }
}

export type DashboardAlerts = Awaited<ReturnType<typeof getDashboardAlerts>>

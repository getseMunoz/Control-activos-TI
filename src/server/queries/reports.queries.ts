import { prisma } from '@/lib/prisma'

const OPEN_INCIDENT_STATUSES = ['open', 'in_review', 'in_progress'] as const
const ACTIVE_MAINTENANCE_STATUSES = [
  'pending',
  'in_progress',
  'waiting_parts',
  'waiting_supplier',
] as const

export async function getReportsSummary() {
  const [
    totalAssets,
    assignedAssets,
    inStorageAssets,
    activeIncidents,
    activeMaintenanceOrders,
    expenseAgg,
    byStatusRaw,
    byTypeRaw,
    byLocationRaw,
    noLocationCount,
    topExpenseGroups,
    recentOpenIncidents,
    recentActiveMaintenance,
  ] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, status: 'assigned' } }),
    prisma.asset.count({ where: { deletedAt: null, status: 'in_storage' } }),
    prisma.incident.count({
      where: {
        status: { in: [...OPEN_INCIDENT_STATUSES] },
        asset: { deletedAt: null },
      },
    }),
    prisma.maintenanceOrder.count({
      where: {
        status: { in: [...ACTIVE_MAINTENANCE_STATUSES] },
        asset: { deletedAt: null },
      },
    }),
    prisma.assetExpense.aggregate({
      _sum: { cost: true },
      where: { asset: { deletedAt: null } },
    }),
    prisma.asset.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
    }),
    prisma.assetType.findMany({
      select: {
        name: true,
        _count: { select: { assets: { where: { deletedAt: null } } } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.location.findMany({
      select: {
        name: true,
        _count: { select: { assets: { where: { deletedAt: null } } } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.asset.count({ where: { deletedAt: null, locationId: null } }),
    prisma.assetExpense.groupBy({
      by: ['assetId'],
      where: { asset: { deletedAt: null } },
      _sum: { cost: true },
      orderBy: { _sum: { cost: 'desc' } },
      take: 10,
    }),
    prisma.incident.findMany({
      where: {
        status: { in: [...OPEN_INCIDENT_STATUSES] },
        asset: { deletedAt: null },
      },
      select: {
        id: true,
        incidentNumber: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        asset: { select: { id: true, internalCode: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.maintenanceOrder.findMany({
      where: {
        status: { in: [...ACTIVE_MAINTENANCE_STATUSES] },
        asset: { deletedAt: null },
      },
      select: {
        id: true,
        orderNumber: true,
        title: true,
        type: true,
        status: true,
        priority: true,
        scheduledDate: true,
        createdAt: true,
        asset: { select: { id: true, internalCode: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const topAssetIds = topExpenseGroups.map((g) => g.assetId)
  const topAssets = await prisma.asset.findMany({
    where: { id: { in: topAssetIds }, deletedAt: null },
    select: { id: true, internalCode: true, name: true, serialNumber: true },
  })
  const assetMap = new Map(topAssets.map((a) => [a.id, a]))

  const topByExpenses = topExpenseGroups
    .map((g) => ({
      asset: assetMap.get(g.assetId),
      totalExpenses: Number(g._sum.cost ?? 0),
    }))
    .filter(
      (e): e is { asset: NonNullable<typeof e.asset>; totalExpenses: number } =>
        e.asset !== undefined,
    )

  const byLocation = [
    ...byLocationRaw.map((l) => ({ name: l.name, count: l._count.assets })),
    ...(noLocationCount > 0 ? [{ name: 'Sin ubicación', count: noLocationCount }] : []),
  ]

  return {
    totalAssets,
    assignedAssets,
    inStorageAssets,
    activeIncidents,
    activeMaintenanceOrders,
    totalExpenses: Number(expenseAgg._sum.cost ?? 0),
    byStatus: byStatusRaw.map((s) => ({ status: s.status, count: s._count.id })),
    byType: byTypeRaw.map((t) => ({ name: t.name, count: t._count.assets })),
    byLocation,
    topByExpenses,
    recentOpenIncidents,
    recentActiveMaintenance,
  }
}

export type ReportsSummary = Awaited<ReturnType<typeof getReportsSummary>>

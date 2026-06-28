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

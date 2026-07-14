import { prisma } from '@/lib/prisma'

export type LocationListItem = Awaited<ReturnType<typeof getLocations>>[number]
export type LocationDetail = NonNullable<Awaited<ReturnType<typeof getLocationById>>>
export type LocationFullDetail = NonNullable<Awaited<ReturnType<typeof getLocationDetail>>>

export async function getLocations() {
  return prisma.location.findMany({
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

export async function getLocationById(id: string) {
  return prisma.location.findFirst({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
    },
  })
}

export async function getLocationDetail(id: string) {
  return prisma.location.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      users: {
        where: { deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          position: true,
          role: true,
          isActive: true,
        },
        orderBy: [{ isActive: 'desc' }, { lastName: 'asc' }],
      },
      assets: {
        where: { deletedAt: null },
        select: {
          id: true,
          internalCode: true,
          name: true,
          serialNumber: true,
          status: true,
          assetType: { select: { name: true } },
          assignments: {
            where: { returnedAt: null },
            take: 1,
            select: {
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
          _count: {
            select: {
              incidents: {
                where: { status: { in: ['open', 'in_review', 'in_progress'] as const } },
              },
              maintenanceOrders: {
                where: {
                  status: {
                    in: ['pending', 'in_progress', 'waiting_parts', 'waiting_supplier'] as const,
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

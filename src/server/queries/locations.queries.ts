import { prisma } from '@/lib/prisma'

export type LocationListItem = Awaited<ReturnType<typeof getLocations>>[number]
export type LocationDetail = NonNullable<Awaited<ReturnType<typeof getLocationById>>>

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

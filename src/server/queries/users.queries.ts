import { prisma } from '@/lib/prisma'

export type UserListItem = Awaited<ReturnType<typeof getUsers>>[number]
export type UserDetail = NonNullable<Awaited<ReturnType<typeof getUserById>>>
export type LocationOption = Awaited<ReturnType<typeof getActiveLocations>>[number]

export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      position: true,
      modality: true,
      isActive: true,
      createdAt: true,
      location: { select: { id: true, name: true } },
    },
    orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function getUserById(id: string) {
  return prisma.user.findFirst({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      position: true,
      phone: true,
      modality: true,
      locationId: true,
      isActive: true,
    },
  })
}

export async function getActiveLocations() {
  return prisma.location.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

import { prisma } from '@/lib/prisma'

export async function getUserPortalSummary(userId: string) {
  const [activeAssignments, returnedAssignments, recentIncidents] = await Promise.all([
    prisma.assetAssignment.findMany({
      where: {
        userId,
        returnedAt: null,
        asset: { deletedAt: null },
      },
      select: {
        id: true,
        assignedAt: true,
        deliverySignedAt: true,
        deliverySignedByName: true,
        asset: {
          select: {
            id: true,
            internalCode: true,
            name: true,
            serialNumber: true,
            brand: true,
            model: true,
            status: true,
            assetType: { select: { name: true } },
            location: { select: { name: true } },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    }),
    prisma.assetAssignment.findMany({
      where: {
        userId,
        returnedAt: { not: null },
        asset: { deletedAt: null },
      },
      select: {
        id: true,
        assignedAt: true,
        returnedAt: true,
        returnSignedAt: true,
        returnUserSignatureData: true,
        returnUserSignedAt: true,
        returnUserSignedByName: true,
        returnRequiresUserSignature: true,
        asset: {
          select: {
            internalCode: true,
            name: true,
            assetType: { select: { name: true } },
          },
        },
      },
      orderBy: { returnedAt: 'desc' },
      take: 10,
    }),
    prisma.incident.findMany({
      where: { reportedBy: userId },
      select: {
        id: true,
        assetId: true,
        incidentNumber: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        resolvedAt: true,
        asset: { select: { internalCode: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return { activeAssignments, returnedAssignments, recentIncidents }
}

export type UserPortalSummary = Awaited<ReturnType<typeof getUserPortalSummary>>

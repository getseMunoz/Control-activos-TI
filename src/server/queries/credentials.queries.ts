import { prisma } from '@/lib/prisma'

export type CredentialListItem = Awaited<ReturnType<typeof getCredentialsByAssetId>>[number]
export type CredentialForEdit = NonNullable<Awaited<ReturnType<typeof getCredentialForEdit>>>

export async function getCredentialsByAssetId(assetId: string) {
  return prisma.assetCredential.findMany({
    where: { assetId, deletedAt: null },
    select: {
      id: true,
      label: true,
      username: true,
      password: true,
      accessUrl: true,
      notes: true,
      createdAt: true,
      createdByUser: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getCredentialForEdit(credentialId: string, assetId: string) {
  return prisma.assetCredential.findFirst({
    where: { id: credentialId, assetId, deletedAt: null },
    select: {
      id: true,
      assetId: true,
      label: true,
      username: true,
      password: true,
      accessUrl: true,
      notes: true,
    },
  })
}

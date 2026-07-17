import { notFound } from 'next/navigation'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTechnicalInfoByAssetId } from '@/server/queries/technical-info.queries'
import { TechnicalInfoForm } from '@/components/features/assets/TechnicalInfoForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditTechnicalInfoPage({ params }: Props) {
  await requireAdminTI()
  const { id: assetId } = await params

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true, name: true, deletedAt: true },
  })
  if (!asset || asset.deletedAt !== null) notFound()

  const techInfo = await getTechnicalInfoByAssetId(assetId)

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
        Activo: <span style={{ fontWeight: 600, color: '#0f172a' }}>{asset.name}</span>
      </p>
      <TechnicalInfoForm assetId={assetId} techInfo={techInfo} />
    </div>
  )
}

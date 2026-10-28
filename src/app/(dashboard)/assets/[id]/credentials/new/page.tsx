import { requireAdminTI } from '@/lib/auth'
import { CredentialCreateForm } from '@/components/features/assets/CredentialCreateForm'

type Props = { params: Promise<{ id: string }> }

export default async function NewCredentialPage({ params }: Props) {
  await requireAdminTI()
  const { id: assetId } = await params

  return <CredentialCreateForm assetId={assetId} />
}

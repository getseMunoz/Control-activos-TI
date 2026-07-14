import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { requireAdminTI } from '@/lib/auth'
import { getCredentialForEdit } from '@/server/queries/credentials.queries'
import { CredentialEditForm } from '@/components/features/assets/CredentialEditForm'

export const metadata: Metadata = { title: 'Editar credencial — CIPRIJAL' }

type Props = { params: Promise<{ id: string; credentialId: string }> }

export default async function EditCredentialPage({ params }: Props) {
  await requireAdminTI()
  const { id: assetId, credentialId } = await params
  const rawCredential = await getCredentialForEdit(credentialId, assetId)

  if (!rawCredential) notFound()

  // Derivar si existe contraseña guardada sin exponer el valor al cliente
  const hasPassword = rawCredential.password !== null
  const { id, label, username, accessUrl, notes } = rawCredential
  const credential = { id, label, username, accessUrl, notes }

  return (
    <div style={{ padding: '32px', maxWidth: '600px' }}>
      <CredentialEditForm assetId={assetId} credential={credential} hasPassword={hasPassword} />
    </div>
  )
}

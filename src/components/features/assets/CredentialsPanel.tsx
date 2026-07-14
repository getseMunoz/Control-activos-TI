'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { deleteCredentialAction } from '@/server/actions/credentials.actions'
import type { CredentialListItem } from '@/server/queries/credentials.queries'
import type { ActionResult } from '@/types'

type Props = {
  assetId: string
  credentials: CredentialListItem[]
  isArchived: boolean
}

function fmt(d: Date): string {
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function DeleteButton({ credentialId, assetId }: { credentialId: string; assetId: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    deleteCredentialAction,
    null,
  )

  return (
    <form action={action} style={{ display: 'inline' }}>
      <input type="hidden" name="id" value={credentialId} />
      <input type="hidden" name="assetId" value={assetId} />
      {state && !state.success && (
        <span style={{ fontSize: '11px', color: '#dc2626', marginRight: '6px' }}>
          {state.error}
        </span>
      )}
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!confirm('¿Eliminar esta credencial? Esta acción no se puede deshacer.')) {
            e.preventDefault()
          }
        }}
        style={{
          fontSize: '12px',
          color: '#ef4444',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {pending ? '...' : 'Eliminar'}
      </button>
    </form>
  )
}

export function CredentialsPanel({ assetId, credentials, isArchived }: Props) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div>
      <div
        style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#92400e',
        }}
      >
        Información visible solo para personal de Sistemas. No compartir ni exportar.
      </div>

      {credentials.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          No hay credenciales registradas para este activo.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                {['Etiqueta', 'Usuario', 'Contraseña', 'URL / Acceso', 'Notas', 'Alta', ''].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#475569',
                        whiteSpace: 'nowrap',
                        background: '#f8fafc',
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {credentials.map((cred, i) => {
                const isRevealed = revealed.has(cred.id)
                return (
                  <tr
                    key={cred.id}
                    style={{
                      borderBottom: i < credentials.length - 1 ? '1px solid #f1f5f9' : undefined,
                    }}
                  >
                    <td
                      style={{
                        padding: '8px 10px',
                        fontWeight: '500',
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cred.label}
                    </td>
                    <td
                      style={{
                        padding: '8px 10px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#475569',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cred.username ?? <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      {cred.password ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              color: '#0f172a',
                              letterSpacing: isRevealed ? 'normal' : '0.12em',
                            }}
                          >
                            {isRevealed ? cred.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(cred.id)}
                            style={{
                              fontSize: '11px',
                              color: '#3b82f6',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0 2px',
                              flexShrink: 0,
                            }}
                          >
                            {isRevealed ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: '220px' }}>
                      {cred.accessUrl ? (
                        <a
                          href={cred.accessUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '12px',
                            color: '#3b82f6',
                            textDecoration: 'none',
                            wordBreak: 'break-all',
                          }}
                        >
                          {cred.accessUrl}
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: '8px 10px',
                        color: '#64748b',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={cred.notes ?? undefined}
                    >
                      {cred.notes ?? '—'}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#94a3b8' }}>
                      <span style={{ fontSize: '11px' }}>
                        {fmt(cred.createdAt)} — {cred.createdByUser.firstName}{' '}
                        {cred.createdByUser.lastName}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {!isArchived && (
                          <Link
                            href={`/assets/${assetId}/credentials/${cred.id}/edit`}
                            style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}
                          >
                            Editar
                          </Link>
                        )}
                        <DeleteButton credentialId={cred.id} assetId={assetId} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isArchived && (
        <div style={{ marginTop: '14px' }}>
          <Link
            href={`/assets/${assetId}/credentials/new`}
            style={{
              fontSize: '13px',
              color: '#2d6a4f',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            + Agregar credencial
          </Link>
        </div>
      )}
    </div>
  )
}

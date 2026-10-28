import type { Metadata } from 'next'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
}

type Props = { searchParams: Promise<{ sessionInvalid?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const { sessionInvalid } = await searchParams

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7f5',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <BrandLogo showSubtitle variant="light" />
          </div>
          <p
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#1a2332',
              margin: '0 0 6px 0',
            }}
          >
            Sistema de Gestión de Activos TI
          </p>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
            Acceso interno para administración y consulta de equipos.
          </p>
        </div>

        {sessionInvalid && (
          <p
            style={{
              fontSize: '13px',
              color: '#b91c1c',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '10px 12px',
              margin: '0 0 16px 0',
              textAlign: 'center',
            }}
          >
            Tu sesión ya no es válida. Por favor, inicia sesión de nuevo.
          </p>
        )}

        <LoginForm />
      </div>
    </div>
  )
}

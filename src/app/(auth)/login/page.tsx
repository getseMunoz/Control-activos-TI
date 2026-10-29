import type { Metadata } from 'next'
import Image from 'next/image'
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
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Fondo: foto a pantalla completa */}
      <Image
        src="/images/login-limones.jpg"
        alt="Campo de limones persas de CIPRIJAL"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover', zIndex: 0 }}
      />

      {/* Capa oscura con degradado verde, sobre la foto */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(180deg, oklch(0.39 0.082 152.2 / 0.55) 0%, oklch(0.39 0.082 152.2 / 0.82) 100%)',
          zIndex: 1,
        }}
      />

      {/* Tarjeta del formulario */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '40px',
            width: '100%',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.35)',
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

        {/* Crédito */}
        <p
          style={{
            color: '#ffffff',
            fontSize: '12px',
            opacity: 0.85,
            marginTop: '20px',
            textAlign: 'center',
          }}
        >
          © Corporativo Ciprijal
        </p>
      </div>
    </div>
  )
}

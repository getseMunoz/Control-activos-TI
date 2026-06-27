import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
}

// Página de login — se implementará en la Fase 2 (Sprint 1)
// Referencia: ARQUITECTURA.md — Sección 5.2, CASOS_USO.md — CU-ADM-01
export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: '#f5f7f5' }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            background: '#2d6a4f',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '20px' }}>C</span>
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a2332', marginBottom: '4px' }}>
          CIPRIJAL
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          Gestión de Activos TI
        </p>
        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Formulario de autenticación — Fase 2</p>
      </div>
    </div>
  )
}

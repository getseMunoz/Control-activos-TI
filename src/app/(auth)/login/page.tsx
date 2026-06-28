import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
}

export default function LoginPage() {
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
        {/* Logotipo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: '#2d6a4f',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '20px' }}>C</span>
          </div>
          <h1
            style={{ fontSize: '20px', fontWeight: '600', color: '#1a2332', marginBottom: '4px' }}
          >
            CIPRIJAL
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Gestión de Activos TI</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}

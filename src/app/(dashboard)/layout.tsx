import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'

const navLinkStyle = {
  display: 'block',
  padding: '6px 8px',
  borderRadius: '6px',
  fontSize: '13px',
  color: '#94a3b8',
  textDecoration: 'none',
} as const

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin_ti'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: '240px',
          background: '#1a2332',
          minHeight: '100vh',
          padding: '24px 16px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Marca */}
        <div
          style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '14px', marginBottom: '32px' }}
        >
          CIPRIJAL Activos TI
        </div>

        {/* Navegación */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
          <Link href="/dashboard" style={navLinkStyle}>
            Dashboard
          </Link>

          {isAdmin && (
            <>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '12px 8px 4px',
                }}
              >
                Administración
              </div>
              <Link href="/admin/users" style={navLinkStyle}>
                Usuarios
              </Link>
              <Link href="/admin/locations" style={navLinkStyle}>
                Ubicaciones
              </Link>
              <Link href="/admin/asset-types" style={navLinkStyle}>
                Tipos de activo
              </Link>
            </>
          )}
        </nav>

        {/* Usuario y cierre de sesión */}
        {session?.user && (
          <div
            style={{
              borderTop: '1px solid #2d3f55',
              paddingTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '500', margin: 0 }}>
                {session.user.name}
              </p>
              <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0' }}>
                {session.user.email}
              </p>
            </div>

            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/login' })
              }}
            >
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid #2d3f55',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        )}
      </aside>

      <main style={{ flex: 1, overflow: 'auto', background: '#f5f7f5' }}>{children}</main>
    </div>
  )
}

import { auth, signOut, requireAuthenticatedUser } from '@/lib/auth'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { NavLink } from './NavLink'
import { userHasAssignmentActivity } from '@/server/queries/assignments.queries'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin_ti'

  // Un admin_ti también puede recibir equipos asignados (ver RN-ASGN-13): si tiene
  // algo pendiente de firmar, se le muestra "Mis activos" además de su menú habitual.
  let adminHasOwnAssignments = false
  if (isAdmin) {
    const { id } = await requireAuthenticatedUser()
    adminHasOwnAssignments = await userHasAssignmentActivity(id)
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { .dashboard-sidebar { display: none !important; } }
.sidebar-nav-link:hover { background: var(--primary-hover) !important; }`,
        }}
      />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside
          className="dashboard-sidebar"
          style={{
            width: '240px',
            background: 'var(--sidebar-bg)',
            minHeight: '100vh',
            padding: '24px 16px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Marca */}
          <div style={{ marginBottom: '32px' }}>
            <BrandLogo showSubtitle variant="dark" />
          </div>

          {/* Navegación */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            {isAdmin ? (
              <>
                <NavLink href="/dashboard">Dashboard</NavLink>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--sidebar-fg)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '12px 8px 4px',
                  }}
                >
                  Administración
                </div>
                <NavLink href="/admin/users">Usuarios</NavLink>
                <NavLink href="/admin/locations">Ubicaciones</NavLink>
                <NavLink href="/admin/asset-types">Tipos de activo</NavLink>
                <NavLink href="/assets">Activos</NavLink>
                <NavLink href="/assignments">Asignaciones</NavLink>
                <NavLink href="/reports">Reportes</NavLink>
                {adminHasOwnAssignments && <NavLink href="/my-assets">Mis activos</NavLink>}
              </>
            ) : (
              <NavLink href="/my-assets">Mis activos</NavLink>
            )}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.18)',
                marginTop: '8px',
                paddingTop: '8px',
              }}
            >
              <NavLink href="/help">Ayuda</NavLink>
            </div>
          </nav>

          {/* Usuario y cierre de sesión */}
          {session?.user && (
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.18)',
                paddingTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <p style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500', margin: 0 }}>
                  {session.user.name}
                </p>
                <p style={{ color: 'var(--sidebar-fg)', fontSize: '12px', margin: '2px 0 0' }}>
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
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '6px',
                    color: '#ffffff',
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
    </>
  )
}

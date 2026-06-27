// Layout protegido del dashboard — se implementará en la Fase 2
// Este layout verificará la sesión y mostrará el sidebar de navegación.
// Referencia: ARQUITECTURA.md — Sección 4, PERMISOS.md

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — Fase 2 */}
      <aside
        style={{
          width: '240px',
          background: '#1a2332',
          minHeight: '100vh',
          padding: '24px 16px',
          flexShrink: 0,
        }}
      >
        <div
          style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '14px', marginBottom: '24px' }}
        >
          CIPRIJAL Activos TI
        </div>
        <p style={{ color: '#64748b', fontSize: '12px' }}>Navegación — Fase 2</p>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto" style={{ background: '#f5f7f5' }}>
        {children}
      </main>
    </div>
  )
}

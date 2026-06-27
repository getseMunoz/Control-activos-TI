import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

// Panel principal con KPIs — se implementará en la Fase 3
// Referencia: PRODUCT_BACKLOG.md — E-10
export default function DashboardPage() {
  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a2332', marginBottom: '8px' }}>
        Panel de control
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Dashboard operativo — Fase 3</p>
    </div>
  )
}

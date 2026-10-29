import type { Metadata } from 'next'
import { requireAuthenticatedUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Ayuda — Guía rápida',
}

const cardStyle = {
  background: 'white',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '24px 28px',
  marginBottom: '16px',
}

const sectionHeader = {
  fontSize: '15px',
  fontWeight: '700' as const,
  color: '#0f172a',
  margin: '0 0 16px 0',
  paddingBottom: '10px',
  borderBottom: '1px solid #f1f5f9',
}

const stepNumber = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  borderRadius: '9999px',
  background: '#2d6a4f',
  color: 'white',
  fontSize: '12px',
  fontWeight: '700' as const,
  flexShrink: 0,
}

const routeTag = {
  display: 'inline-block',
  background: '#f1f5f9',
  color: '#475569',
  fontSize: '11px',
  fontFamily: 'monospace',
  padding: '2px 8px',
  borderRadius: '4px',
  marginBottom: '4px',
}

const tipBullet = {
  width: '6px',
  height: '6px',
  borderRadius: '9999px',
  background: '#2d6a4f',
  flexShrink: 0,
  marginTop: '6px',
}

const FLOW_STEPS = [
  {
    title: 'Registrar activo',
    route: 'Activos → Nuevo activo',
    description:
      'Captura el tipo, marca, modelo, número de serie obligatorio, ubicación, proveedor y datos de compra del equipo.',
  },
  {
    title: 'Asignar activo a usuario',
    route: 'Asignaciones → Nueva asignación',
    description:
      'Selecciona el usuario receptor, fecha de asignación, ubicación de entrega y accesorios incluidos.',
  },
  {
    title: 'Capturar firma de entrega',
    route: 'Mis activos → Firmar recepción',
    description:
      'El usuario firma digitalmente la recepción del equipo desde su portal "Mis activos", cuando el equipo queda pendiente de firma.',
  },
  {
    title: 'Generar responsiva de entrega',
    route: 'Asignaciones → Responsiva → Imprimir',
    description:
      'Consulta e imprime la responsiva de entrega con los datos del activo, usuario y firma.',
  },
  {
    title: 'Registrar devolución',
    route: 'Asignaciones → [Asignación] → Devolver',
    description:
      'Registra la fecha de devolución y notas del equipo. El activo vuelve a estado disponible.',
  },
  {
    title: 'Firma de devolución',
    route: 'Asignaciones → [Asignación] → Devolver',
    description:
      'Durante el registro de devolución, el responsable de Sistemas firma digitalmente la recepción del equipo. Después, el propio usuario debe firmar por separado desde su portal "Mis activos" que entregó el equipo.',
  },
  {
    title: 'Generar responsiva de devolución',
    route: 'Asignaciones → Resp. devolución → Imprimir',
    description:
      'Consulta e imprime la responsiva de devolución, que muestra por separado la firma de quien entrega el equipo y la firma de quien lo recibe.',
  },
  {
    title: 'Consultar historial del activo',
    route: 'Activos → [Activo]',
    description:
      'Revisa el historial completo: asignaciones anteriores, incidencias, mantenimientos y gastos.',
  },
]

const DAILY_OPS = [
  {
    title: 'Dashboard y alertas operativas',
    route: '/dashboard',
    description:
      'Visualiza contadores generales y alertas: incidencias abiertas, mantenimientos activos, asignaciones sin firma de entrega y devoluciones sin firma.',
  },
  {
    title: 'Filtros de activos',
    route: '/assets',
    description:
      'Busca activos por código, nombre, serie, tipo, ubicación o estado. Exporta el resultado a CSV.',
  },
  {
    title: 'Filtros de asignaciones',
    route: '/assignments',
    description:
      'Filtra asignaciones por estado, usuario, activo o rango de fechas. Exporta el historial filtrado a CSV.',
  },
  {
    title: 'Incidencias',
    route: 'Activos → [Activo] → Incidencias',
    description:
      'Registra y da seguimiento a fallas reportadas sobre un equipo. Los usuarios finales también pueden reportar desde su portal.',
  },
  {
    title: 'Mantenimiento',
    route: 'Activos → [Activo] → Mantenimiento',
    description:
      'Crea órdenes de trabajo preventivo o correctivo. Asocia órdenes a incidencias existentes.',
  },
  {
    title: 'Gastos',
    route: 'Activos → [Activo] → Gastos',
    description:
      'Registra el costo de reparaciones, mantenimientos o accesorios adicionales del equipo.',
  },
  {
    title: 'Reportes',
    route: '/reports',
    description:
      'Consulta el resumen operativo: distribución de activos por estado, tipo y ubicación, top activos por gasto e incidencias y mantenimientos abiertos.',
  },
  {
    title: 'Exportación CSV',
    route: '/assets → Exportar CSV  ·  /assignments → Exportar CSV',
    description:
      'Descarga el inventario de activos o el historial de asignaciones en formato CSV compatible con Excel, respetando los filtros activos.',
  },
]

const USER_PORTAL = [
  {
    title: 'Ver activos asignados',
    description:
      'Consulta todos los equipos actualmente bajo tu resguardo, con serie, marca y ubicación.',
  },
  {
    title: 'Consultar responsivas propias',
    description:
      'Accede a la responsiva de entrega y, una vez devuelto el equipo, a la responsiva de devolución, desde la tarjeta de cada equipo.',
  },
  {
    title: 'Reportar fallas',
    description:
      'Usa el botón "Reportar falla" en cada equipo para registrar una incidencia directamente al área de TI.',
  },
  {
    title: 'Consultar devoluciones recientes',
    description:
      'Revisa el historial de equipos que has devuelto, incluyendo si tu firma de devolución ya se registró o sigue pendiente.',
  },
]

const TIPS = [
  'Verificar el número de serie antes de registrar o asignar un equipo.',
  'Capturar la firma siempre que se entregue o devuelva un equipo, para respaldo legal.',
  'Registrar accesorios y notas importantes en cada asignación.',
  'Usar Incidencias para reportar fallas; usar Mantenimiento para órdenes técnicas de trabajo.',
  'No compartir credenciales de acceso al sistema.',
  'Exportar reportes CSV antes de auditorías o cortes administrativos.',
  'Actualizar la ubicación del activo cuando cambie de área o sucursal.',
]

export default async function HelpPage() {
  const user = await requireAuthenticatedUser()
  const isAdmin = user.role === 'admin_ti'

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
            Guía rápida del sistema
          </h1>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: isAdmin ? '#eff6ff' : '#f0fdf4',
              color: isAdmin ? '#2563eb' : '#16a34a',
            }}
          >
            {isAdmin ? 'Administrador TI' : 'Usuario Final'}
          </span>
        </div>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Consulta cómo registrar, asignar, devolver y dar seguimiento a los activos TI.
        </p>
      </div>

      {/* Sección 1: Flujo principal — solo admin */}
      {isAdmin && (
        <div style={cardStyle}>
          <h2 style={sectionHeader}>1 · Flujo principal de un activo</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {FLOW_STEPS.map((step, i) => (
              <div key={step.title} style={{ display: 'flex', gap: '12px' }}>
                <div style={stepNumber}>{i + 1}</div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#0f172a',
                      margin: '0 0 2px',
                    }}
                  >
                    {step.title}
                  </p>
                  <span style={routeTag}>{step.route}</span>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección 2: Operación diaria — solo admin */}
      {isAdmin && (
        <div style={cardStyle}>
          <h2 style={sectionHeader}>2 · Operación diaria para TI</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '16px',
            }}
          >
            {DAILY_OPS.map((op) => (
              <div
                key={op.title}
                style={{
                  background: '#fafafa',
                  border: '1px solid #f1f5f9',
                  borderRadius: '8px',
                  padding: '14px 16px',
                }}
              >
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a',
                    margin: '0 0 4px',
                  }}
                >
                  {op.title}
                </p>
                <span style={routeTag}>{op.route}</span>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0' }}>
                  {op.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección 3: Portal usuario final */}
      <div style={cardStyle}>
        <h2 style={sectionHeader}>
          {isAdmin ? '3 · Portal usuario final' : '1 · Tu portal de activos TI'}
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
          Ruta: <span style={routeTag}>Mis activos / Portal de activos TI</span>
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px',
          }}
        >
          {USER_PORTAL.map((item) => (
            <div
              key={item.title}
              style={{
                background: '#fafafa',
                border: '1px solid #f1f5f9',
                borderRadius: '8px',
                padding: '14px 16px',
              }}
            >
              <p
                style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px' }}
              >
                {item.title}
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sección 4: Roles */}
      <div style={cardStyle}>
        <h2 style={sectionHeader}>{isAdmin ? '4 · Roles del sistema' : '2 · Roles del sistema'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Admin TI */}
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '16px 20px',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#1d4ed8',
                margin: '0 0 12px',
              }}
            >
              Administrador TI
            </p>
            {[
              'Gestiona usuarios y catálogos',
              'Registra y administra activos',
              'Asigna y devuelve equipos',
              'Captura y consulta firmas',
              'Registra gastos, incidencias y mantenimiento',
              'Consulta reportes operativos',
              'Exporta inventario y asignaciones a CSV',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <div style={{ ...tipBullet, background: '#2563eb' }} />
                <span style={{ fontSize: '12px', color: '#1e3a5f' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Usuario final */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '16px 20px',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#15803d',
                margin: '0 0 12px',
              }}
            >
              Usuario Final
            </p>
            {[
              'Consulta sus activos asignados',
              'Accede a sus responsivas de entrega y devolución',
              'Reporta fallas sobre sus equipos',
              'Consulta devoluciones recientes',
              'Firma digitalmente desde su portal',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <div style={tipBullet} />
                <span style={{ fontSize: '12px', color: '#14532d' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección 5: Buenas prácticas */}
      <div style={cardStyle}>
        <h2 style={sectionHeader}>{isAdmin ? '5 · Buenas prácticas' : '3 · Buenas prácticas'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {TIPS.map((tip) => (
            <div key={tip} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={tipBullet} />
              <span style={{ fontSize: '13px', color: '#475569' }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pie */}
      <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
        CIPRIJAL — Sistema de Gestión de Activos TI · Uso interno
      </p>
    </div>
  )
}

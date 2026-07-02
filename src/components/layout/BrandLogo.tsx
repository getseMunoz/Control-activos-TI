type Props = {
  compact?: boolean
  showSubtitle?: boolean
  variant?: 'light' | 'dark'
}

export function BrandLogo({ compact = false, showSubtitle = false, variant = 'light' }: Props) {
  const isDark = variant === 'dark'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? '8px' : '10px',
      }}
    >
      {/* Iniciales */}
      <div
        style={{
          width: compact ? '32px' : '40px',
          height: compact ? '32px' : '40px',
          background: '#2d6a4f',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontWeight: '700',
            fontSize: compact ? '13px' : '16px',
            letterSpacing: '-0.5px',
          }}
        >
          CI
        </span>
      </div>

      {/* Texto */}
      <div>
        <p
          style={{
            margin: 0,
            fontWeight: '700',
            fontSize: compact ? '13px' : '15px',
            color: isDark ? '#e2e8f0' : '#1a2332',
            lineHeight: 1.2,
          }}
        >
          CIPRIJAL
        </p>
        {showSubtitle && (
          <p
            style={{
              margin: 0,
              fontSize: '11px',
              fontWeight: '500',
              color: isDark ? '#64748b' : '#94a3b8',
              letterSpacing: '0.03em',
              lineHeight: 1.2,
            }}
          >
            Activos TI
          </p>
        )}
      </div>
    </div>
  )
}

import Image from 'next/image'

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
      {/* Logotipo */}
      <div
        style={{
          width: compact ? '32px' : '40px',
          height: compact ? '32px' : '40px',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <Image
          src="/images/logo-ciprijal.png"
          alt="Logotipo de CIPRIJAL"
          fill
          sizes={compact ? '32px' : '40px'}
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Texto */}
      <div>
        <p
          style={{
            margin: 0,
            fontWeight: '700',
            fontSize: compact ? '13px' : '15px',
            color: isDark ? '#ffffff' : '#1a2332',
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
              color: isDark ? 'var(--sidebar-fg)' : '#94a3b8',
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

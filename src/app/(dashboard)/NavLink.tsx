'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  href: string
  children: React.ReactNode
}

// Recibe el enlace ya decidido por el layout del servidor (según rol).
// Solo decide el estilo visual (activo / inactivo), nunca qué enlaces mostrar.
export function NavLink({ href, children }: Props) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className="sidebar-nav-link"
      style={{
        display: 'block',
        padding: '6px 8px 6px 8px',
        paddingLeft: isActive ? '5px' : '8px',
        borderLeft: isActive ? '3px solid var(--primary-lighter)' : '3px solid transparent',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: isActive ? '600' : '400',
        color: '#ffffff',
        textDecoration: 'none',
        background: isActive ? 'var(--primary-hover)' : 'transparent',
      }}
    >
      {children}
    </Link>
  )
}

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    default: 'CIPRIJAL — Gestión de Activos TI',
    template: '%s | CIPRIJAL Activos TI',
  },
  description: 'Sistema de Gestión de Activos TI para CIPRIJAL',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={cn('h-full', geist.variable)}>
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  )
}

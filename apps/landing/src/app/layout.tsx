import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sueldos & Organigrama - Descubre lo que realmente se necesita',
  description: 'Plataforma colaborativa para conocer requisitos reales de puestos de trabajo: salarios, habilidades, experiencia y más.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

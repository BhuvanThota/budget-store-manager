// src/app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientProviders } from './client-providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Budget Shop Manager',
  description: 'A Next.js application for managing your budget and store.',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
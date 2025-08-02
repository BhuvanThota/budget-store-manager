// src/app/client-providers.tsx

'use client'

import { SessionProvider } from 'next-auth/react'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

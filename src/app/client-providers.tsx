// app/client-providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // This state ensures that the QueryClient is only created once,
  // preventing re-renders from creating new clients.
  const [queryClient] = useState(() => new QueryClient());

  return (
    // The QueryClientProvider needs to be available to all components that will fetch data.
    <QueryClientProvider client={queryClient}>
        {/* Your existing SessionProvider for NextAuth can go here. */}
        <SessionProvider>
            {children}
        </SessionProvider>
    </QueryClientProvider>
  );
}
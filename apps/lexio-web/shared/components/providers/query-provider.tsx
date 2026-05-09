'use client';

/**
 * QueryProvider — wraps children with TanStack QueryClientProvider.
 * Must be a client component because QueryClient uses React context.
 * Imported in app/(app)/layout.tsx (authenticated routes only).
 */
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api/query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

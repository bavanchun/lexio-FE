/**
 * TanStack Query client configuration.
 * Import `queryClient` wherever a QueryClient instance is needed
 * (e.g. QueryClientProvider in app layout).
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** 5 minutes — data from IndexedDB is local and rarely stale. */
      staleTime: 5 * 60 * 1000,
      /** Retry once on failure; IndexedDB errors are usually permanent. */
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

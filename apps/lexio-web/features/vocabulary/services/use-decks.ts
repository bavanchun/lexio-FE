'use client';

/**
 * useDecks — TanStack Query hook to fetch all decks for the current user.
 * Calls apiClient.decks.listMyDecks(userId).
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient, queryKeys } from '@/lib/api';

export function useDecks(userId: string) {
  return useQuery({
    queryKey: queryKeys.decks.all(userId),
    queryFn: () => apiClient.decks.listMyDecks(userId),
    enabled: Boolean(userId),
  });
}

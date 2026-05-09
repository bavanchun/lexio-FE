'use client';

/**
 * useDeck — TanStack Query hook to fetch a single deck by ID.
 * Calls apiClient.decks.getDeck(deckId).
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient, queryKeys } from '@/lib/api';
import type { DeckId } from '@/core/entities/deck';

export function useDeck(deckId: string) {
  return useQuery({
    queryKey: queryKeys.decks.detail(deckId),
    queryFn: () => apiClient.decks.getDeck(deckId as DeckId),
    enabled: Boolean(deckId),
  });
}

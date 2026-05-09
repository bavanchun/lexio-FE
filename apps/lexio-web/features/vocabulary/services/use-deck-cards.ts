'use client';

/**
 * useDeckCards — TanStack Query hook to fetch all cards for a given deck.
 * Calls apiClient.cards.listByDeck(deckId).
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient, queryKeys } from '@/lib/api';
import type { DeckId } from '@/core/entities/card';

export function useDeckCards(deckId: string) {
  return useQuery({
    queryKey: queryKeys.decks.cards(deckId),
    queryFn: () => apiClient.cards.listByDeck(deckId as DeckId),
    enabled: Boolean(deckId),
  });
}

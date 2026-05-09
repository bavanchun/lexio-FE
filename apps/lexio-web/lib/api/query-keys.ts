/**
 * Centralized TanStack Query cache keys.
 * Consistent keys ensure invalidation works correctly across features.
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.decks.all(userId) })
 */

export const queryKeys = {
  decks: {
    all: (userId: string) => ['decks', userId] as const,
    detail: (deckId: string) => ['decks', 'detail', deckId] as const,
    cards: (deckId: string) => ['decks', deckId, 'cards'] as const,
  },
  userCards: {
    due: (userId: string) => ['userCards', userId, 'due'] as const,
    new: (userId: string) => ['userCards', userId, 'new'] as const,
    detail: (userCardId: string) => ['userCards', 'detail', userCardId] as const,
  },
  sessions: {
    detail: (sessionId: string) => ['sessions', sessionId] as const,
    reviews: (sessionId: string) => ['sessions', sessionId, 'reviews'] as const,
  },
  stats: {
    streak: (userId: string) => ['stats', userId, 'streak'] as const,
    xp: (userId: string) => ['stats', userId, 'xp'] as const,
    achievements: (userId: string) => ['stats', userId, 'achievements'] as const,
  },
} as const;

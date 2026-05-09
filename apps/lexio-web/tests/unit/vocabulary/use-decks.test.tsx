/**
 * Unit test — useDecks hook.
 * Verifies the hook calls apiClient.decks.listMyDecks and returns data correctly.
 * Uses a mock apiClient to avoid Dexie/IndexedDB dependency.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Deck } from '@/core/entities/deck';
import type { DeckId } from '@/core/entities/card';

// ── Mock apiClient ─────────────────────────────────────────────────────────────
// vi.mock is hoisted by Vitest — factory must be self-contained (no outer refs).
vi.mock('@/lib/api', () => ({
  apiClient: {
    decks: { listMyDecks: vi.fn() },
  },
  queryKeys: {
    decks: {
      all: (userId: string) => ['decks', userId] as const,
      detail: (deckId: string) => ['decks', 'detail', deckId] as const,
      cards: (deckId: string) => ['decks', deckId, 'cards'] as const,
    },
  },
}));

// Import hook after mock registration (Vitest hoists vi.mock above all imports)
// eslint-disable-next-line boundaries/dependencies
import { useDecks } from '@/features/vocabulary/services/use-decks';
// Import the mocked module to access mock functions
import { apiClient } from '@/lib/api';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const stubDeck: Deck = {
  id: 'seed-deck-it-tech-001' as DeckId,
  ownerId: 'stub-user-000',
  title: 'IT/Tech Essentials',
  description: 'Core IT vocabulary.',
  visibility: 'private',
  cloneCount: 0,
  createdAt: new Date('2025-01-01').toISOString(),
  updatedAt: new Date('2025-01-01').toISOString(),
};

// ── Wrapper ────────────────────────────────────────────────────────────────────

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

// ─────────────────────────────────────────────────────────────────────────────

// Typed reference to the mock function
const mockFn = apiClient.decks.listMyDecks as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockFn.mockClear();
});

describe('useDecks', () => {
  it('returns decks on success', async () => {
    mockFn.mockResolvedValue([stubDeck]);

    const { result } = renderHook(() => useDecks('stub-user-000'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data ?? [];
    expect(data).toHaveLength(1);
    const first = data[0];
    expect(first?.title).toBe('IT/Tech Essentials');
    expect(mockFn).toHaveBeenCalledWith('stub-user-000');
  });

  it('is disabled when userId is empty', async () => {
    const { result } = renderHook(() => useDecks(''), {
      wrapper: makeWrapper(),
    });

    // Query disabled — stays pending; mock never called
    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('surfaces error state on api failure', async () => {
    mockFn.mockRejectedValue(new Error('DB error'));

    const { result } = renderHook(() => useDecks('stub-user-000'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

/**
 * Integration test — /decks page (DeckGrid rendering).
 * Tests: deck cards render, click navigates to deck detail.
 *
 * Scope: renders DeckGrid directly with mock data — avoids full Next.js
 * page rendering complexity while covering the critical render + navigation path.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeckGrid } from '@/features/vocabulary/components/deck-grid';
import type { Deck } from '@/core/entities/deck';
import type { DeckId } from '@/core/entities/card';

// ── next/navigation mock ─────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => '/decks',
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockDeck: Deck = {
  id: 'seed-deck-it-tech-001' as DeckId,
  ownerId: 'stub-user-000',
  title: 'IT/Tech Essentials',
  description: 'Core IT and technology vocabulary for B2 learners.',
  visibility: 'private',
  cloneCount: 0,
  createdAt: new Date('2025-01-01').toISOString(),
  updatedAt: new Date('2025-01-01').toISOString(),
};

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockPush.mockClear();
});

describe('DeckGrid', () => {
  it('renders deck title and description', () => {
    render(<DeckGrid decks={[mockDeck]} cardCounts={{ 'seed-deck-it-tech-001': 30 }} />, {
      wrapper,
    });

    expect(screen.getByText('IT/Tech Essentials')).toBeInTheDocument();
    expect(screen.getByText(/Core IT and technology/)).toBeInTheDocument();
  });

  it('shows card count when provided', () => {
    render(<DeckGrid decks={[mockDeck]} cardCounts={{ 'seed-deck-it-tech-001': 30 }} />, {
      wrapper,
    });

    expect(screen.getByText(/30 cards/)).toBeInTheDocument();
  });

  it('navigates to deck detail on click', () => {
    render(<DeckGrid decks={[mockDeck]} />, { wrapper });

    const deckCard = screen.getByRole('link', { name: /IT\/Tech Essentials/ });
    fireEvent.click(deckCard);

    expect(mockPush).toHaveBeenCalledWith('/decks/seed-deck-it-tech-001');
  });

  it('renders multiple decks', () => {
    const deck2: Deck = {
      ...mockDeck,
      id: 'deck-002' as DeckId,
      title: 'Business English',
      description: null,
    };

    render(<DeckGrid decks={[mockDeck, deck2]} />, { wrapper });

    expect(screen.getByText('IT/Tech Essentials')).toBeInTheDocument();
    expect(screen.getByText('Business English')).toBeInTheDocument();
  });
});

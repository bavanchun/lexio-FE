/**
 * Integration test — CardsTable + CardPreviewDrawer.
 * Tests: cards table renders, click row opens drawer, drawer shows IPA with
 * Charis SIL class, audio button disabled when URL is null.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CardsTable } from '@/features/vocabulary/components/cards-table';
import type { Card, CardId, DeckId } from '@/core/entities/card';

// ── next/navigation mock ─────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/decks/seed-deck-it-tech-001',
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockCard: Card = {
  id: 'seed-card-001' as CardId,
  deckId: 'seed-deck-it-tech-001' as DeckId,
  word: 'bandwidth',
  ipa: 'ˈbændˌwɪdθ',
  definition: 'The maximum rate of data transfer across a given path.',
  exampleSentence: 'We need more bandwidth to support video streaming.',
  exampleTranslation: null,
  audioWordUrl: null,
  audioSentenceUrl: null,
  imageUrl: null,
  tags: ['noun', 'networking'],
  cefrLevel: 'B2',
  exerciseTypes: ['flashcard', 'multiple_choice'],
  createdBy: 'stub-user-000',
  createdAt: new Date('2025-01-01').toISOString(),
  updatedAt: new Date('2025-01-01').toISOString(),
};

const cardWithAudio: Card = {
  ...mockCard,
  id: 'seed-card-002' as CardId,
  word: 'algorithm',
  audioWordUrl: 'https://example.com/algorithm.mp3',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CardsTable', () => {
  it('renders card rows with word, CEFR badge, and IPA', () => {
    render(<CardsTable cards={[mockCard]} />, { wrapper });

    expect(screen.getByText('bandwidth')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
    // IPA rendered in table row
    expect(screen.getByText(/ˈbændˌwɪdθ/)).toBeInTheDocument();
  });

  it('applies font-ipa class to IPA text for Charis SIL', () => {
    render(<CardsTable cards={[mockCard]} />, { wrapper });

    const ipaEl = screen.getByText(/ˈbændˌwɪdθ/);
    expect(ipaEl).toHaveClass('font-ipa');
  });

  it('shows loading skeletons when isLoading=true', () => {
    render(<CardsTable cards={[]} isLoading />, { wrapper });
    // Skeletons render — no card rows
    expect(screen.queryByText('bandwidth')).not.toBeInTheDocument();
  });

  it('shows empty state when no cards', () => {
    render(<CardsTable cards={[]} />, { wrapper });
    expect(screen.getByText(/No cards in this deck yet/)).toBeInTheDocument();
  });

  it('opens preview drawer on row click', async () => {
    render(<CardsTable cards={[mockCard]} />, { wrapper });

    const row = screen.getByRole('row', { name: /Preview card: bandwidth/ });
    fireEvent.click(row);

    // Drawer should show card word in header
    await waitFor(() => {
      expect(screen.getAllByText('bandwidth').length).toBeGreaterThan(1);
    });
  });

  it('shows audio button disabled when audioWordUrl is null', async () => {
    render(<CardsTable cards={[mockCard]} />, { wrapper });

    fireEvent.click(screen.getByRole('row', { name: /Preview card: bandwidth/ }));

    await waitFor(() => {
      const wordAudioBtn = screen.getByRole('button', { name: 'Word' });
      expect(wordAudioBtn).toBeDisabled();
    });
  });

  it('shows audio button enabled when audioWordUrl is present', async () => {
    render(<CardsTable cards={[cardWithAudio]} />, { wrapper });

    fireEvent.click(screen.getByRole('row', { name: /Preview card: algorithm/ }));

    await waitFor(() => {
      const wordAudioBtn = screen.getByRole('button', { name: 'Word' });
      expect(wordAudioBtn).not.toBeDisabled();
    });
  });
});

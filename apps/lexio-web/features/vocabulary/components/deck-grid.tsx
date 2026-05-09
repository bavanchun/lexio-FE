/**
 * DeckGrid — responsive grid layout for DeckCard list.
 * 1 col mobile / 2 col md / 3 col lg.
 */
// eslint-disable-next-line boundaries/dependencies
import { DeckCard } from './deck-card';
import type { Deck } from '@/core/entities/deck';

interface DeckGridProps {
  decks: Deck[];
  /** Optional map of deckId → card count for display in each card. */
  cardCounts?: Record<string, number>;
}

export function DeckGrid({ decks, cardCounts }: DeckGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} cardCount={cardCounts?.[deck.id]} />
      ))}
    </div>
  );
}

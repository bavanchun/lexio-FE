/**
 * ICardRepository port — defines the contract for card persistence.
 * Implemented by lib/storage (Dexie) in phase-05. Pure TS — no framework imports.
 */

import type { Card, CardId, DeckId } from '../entities/card';

export interface CardSearchQuery {
  term: string;
  cefrLevel?: Card['cefrLevel'];
  tags?: string[];
  limit?: number;
}

export interface ICardRepository {
  findById(id: CardId): Promise<Card | null>;
  search(query: CardSearchQuery): Promise<Card[]>;
  listByDeck(deckId: DeckId): Promise<Card[]>;
  create(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card>;
  update(id: CardId, patch: Partial<Omit<Card, 'id'>>): Promise<Card>;
  delete(id: CardId): Promise<void>;
}

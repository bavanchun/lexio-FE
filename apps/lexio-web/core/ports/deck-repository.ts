/**
 * IDeckRepository port — defines the contract for deck persistence.
 * Implemented by lib/storage (Dexie) in phase-05. Pure TS — no framework imports.
 */

import type { Deck, DeckId } from '../entities/deck';

export interface IDeckRepository {
  findById(id: DeckId): Promise<Deck | null>;
  listByOwner(userId: string): Promise<Deck[]>;
  create(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'cloneCount'>): Promise<Deck>;
  update(id: DeckId, patch: Partial<Omit<Deck, 'id'>>): Promise<Deck>;
  delete(id: DeckId): Promise<void>;
}

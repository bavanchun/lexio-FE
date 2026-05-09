/**
 * DeckRepositoryDexie — Dexie adapter implementing IDeckRepository.
 * Dexie types confined here; public signatures use core entities.
 */

import type { IDeckRepository } from '@/core/ports/deck-repository';
import type { Deck, DeckId } from '@/core/entities/deck';
import type { LexioDB, DeckRow } from '../database';
import { RepositoryError, NotFoundError } from '../errors';

// ---------------------------------------------------------------------------
// Row ↔ Entity mappers
// ---------------------------------------------------------------------------

function toEntity(row: DeckRow): Deck {
  return {
    id: row.id as DeckId,
    ownerId: row.ownerId,
    title: row.title,
    description: row.description,
    visibility: row.visibility,
    cloneCount: row.cloneCount,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

function toRow(entity: Deck): DeckRow {
  return {
    id: entity.id,
    ownerId: entity.ownerId,
    title: entity.title,
    description: entity.description,
    visibility: entity.visibility,
    cloneCount: entity.cloneCount,
    createdAt: new Date(entity.createdAt).getTime(),
    updatedAt: new Date(entity.updatedAt).getTime(),
  };
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------

export class DeckRepositoryDexie implements IDeckRepository {
  constructor(private readonly db: LexioDB) {}

  async findById(id: DeckId): Promise<Deck | null> {
    try {
      const row = await this.db.decks.get(id);
      return row ? toEntity(row) : null;
    } catch (err) {
      throw new RepositoryError(`Failed to find deck by id: ${id}`, err);
    }
  }

  async listByOwner(userId: string): Promise<Deck[]> {
    try {
      const rows = await this.db.decks.where('ownerId').equals(userId).toArray();
      return rows.map(toEntity);
    } catch (err) {
      throw new RepositoryError(`Failed to list decks for owner: ${userId}`, err);
    }
  }

  async create(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'cloneCount'>): Promise<Deck> {
    try {
      const now = Date.now();
      const entity: Deck = {
        ...deck,
        id: crypto.randomUUID() as DeckId,
        cloneCount: 0,
        createdAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
      };
      await this.db.decks.put(toRow(entity));
      return entity;
    } catch (err) {
      throw new RepositoryError('Failed to create deck', err);
    }
  }

  async update(id: DeckId, patch: Partial<Omit<Deck, 'id'>>): Promise<Deck> {
    try {
      const existing = await this.db.decks.get(id);
      if (!existing) throw new NotFoundError('Deck', id);
      const updated: Deck = {
        ...toEntity(existing),
        ...patch,
        id,
        updatedAt: new Date().toISOString(),
      };
      await this.db.decks.put(toRow(updated));
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError(`Failed to update deck: ${id}`, err);
    }
  }

  async delete(id: DeckId): Promise<void> {
    try {
      await this.db.decks.delete(id);
    } catch (err) {
      throw new RepositoryError(`Failed to delete deck: ${id}`, err);
    }
  }
}

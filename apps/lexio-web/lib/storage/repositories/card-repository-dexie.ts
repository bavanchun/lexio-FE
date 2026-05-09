/**
 * CardRepositoryDexie — Dexie adapter implementing ICardRepository.
 * Dexie types are confined to this file; public method signatures use core entities.
 */

import type { ICardRepository, CardSearchQuery } from '@/core/ports/card-repository';
import type { Card, CardId, DeckId } from '@/core/entities/card';
import type { LexioDB, CardRow } from '../database';
import { RepositoryError, NotFoundError } from '../errors';

// ---------------------------------------------------------------------------
// Row ↔ Entity mappers
// ---------------------------------------------------------------------------

function toEntity(row: CardRow): Card {
  return {
    id: row.id as CardId,
    deckId: row.deckId as DeckId,
    word: row.word,
    // v2 fields — fall back to null for rows migrated from v1
    ipaUs: row.ipaUs ?? row.ipa ?? null,
    ipaUk: row.ipaUk ?? null,
    ipa: row.ipa ?? null,
    definition: row.definition,
    exampleSentence: row.exampleSentence,
    exampleTranslation: row.exampleTranslation,
    audioWordUrl: row.audioWordUrl,
    audioSentenceUrl: row.audioSentenceUrl,
    imageUrl: row.imageUrl,
    tags: row.tags,
    cefrLevel: row.cefrLevel,
    exerciseTypes: row.exerciseTypes as Card['exerciseTypes'],
    collocations: row.collocations ?? [],
    synonyms: row.synonyms ?? [],
    antonyms: row.antonyms ?? [],
    wordFamily: row.wordFamily ?? null,
    etymology: row.etymology ?? null,
    frequencyRank: row.frequencyRank ?? null,
    createdBy: row.createdBy,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

function toRow(entity: Card): CardRow {
  return {
    id: entity.id,
    deckId: entity.deckId,
    word: entity.word,
    ipa: entity.ipa ?? null,
    ipaUs: entity.ipaUs ?? null,
    ipaUk: entity.ipaUk ?? null,
    definition: entity.definition,
    exampleSentence: entity.exampleSentence,
    exampleTranslation: entity.exampleTranslation,
    audioWordUrl: entity.audioWordUrl,
    audioSentenceUrl: entity.audioSentenceUrl,
    imageUrl: entity.imageUrl,
    tags: entity.tags,
    cefrLevel: entity.cefrLevel,
    exerciseTypes: entity.exerciseTypes,
    collocations: entity.collocations ?? [],
    synonyms: entity.synonyms ?? [],
    antonyms: entity.antonyms ?? [],
    wordFamily: entity.wordFamily ?? null,
    etymology: entity.etymology ?? null,
    frequencyRank: entity.frequencyRank ?? null,
    createdBy: entity.createdBy,
    createdAt: new Date(entity.createdAt).getTime(),
    updatedAt: new Date(entity.updatedAt).getTime(),
  };
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------

export class CardRepositoryDexie implements ICardRepository {
  constructor(private readonly db: LexioDB) {}

  async findById(id: CardId): Promise<Card | null> {
    try {
      const row = await this.db.cards.get(id);
      return row ? toEntity(row) : null;
    } catch (err) {
      throw new RepositoryError(`Failed to find card by id: ${id}`, err);
    }
  }

  async search(query: CardSearchQuery): Promise<Card[]> {
    try {
      const { term, cefrLevel, tags, limit = 50 } = query;
      const lower = term.toLowerCase();

      const collection = this.db.cards.filter((row) => {
        const matchesTerm =
          row.word.toLowerCase().includes(lower) || row.definition.toLowerCase().includes(lower);
        const matchesCefr = cefrLevel == null || row.cefrLevel === cefrLevel;
        const matchesTags = !tags?.length || tags.every((t) => row.tags.includes(t));
        return matchesTerm && matchesCefr && matchesTags;
      });

      const rows = await collection.limit(limit).toArray();
      return rows.map(toEntity);
    } catch (err) {
      throw new RepositoryError('Failed to search cards', err);
    }
  }

  async listByDeck(deckId: DeckId): Promise<Card[]> {
    try {
      const rows = await this.db.cards.where('deckId').equals(deckId).toArray();
      return rows.map(toEntity);
    } catch (err) {
      throw new RepositoryError(`Failed to list cards for deck: ${deckId}`, err);
    }
  }

  async create(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    try {
      const now = Date.now();
      const entity: Card = {
        ...card,
        id: crypto.randomUUID() as CardId,
        createdAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
      };
      await this.db.cards.put(toRow(entity));
      return entity;
    } catch (err) {
      throw new RepositoryError('Failed to create card', err);
    }
  }

  async update(id: CardId, patch: Partial<Omit<Card, 'id'>>): Promise<Card> {
    try {
      const existing = await this.db.cards.get(id);
      if (!existing) throw new NotFoundError('Card', id);
      const updated: Card = {
        ...toEntity(existing),
        ...patch,
        id,
        updatedAt: new Date().toISOString(),
      };
      await this.db.cards.put(toRow(updated));
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError(`Failed to update card: ${id}`, err);
    }
  }

  async delete(id: CardId): Promise<void> {
    try {
      await this.db.cards.delete(id);
    } catch (err) {
      throw new RepositoryError(`Failed to delete card: ${id}`, err);
    }
  }
}

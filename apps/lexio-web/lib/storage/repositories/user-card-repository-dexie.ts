/**
 * UserCardRepositoryDexie — Dexie adapter implementing IUserCardRepository.
 * Critical: [userId+nextReviewAt] compound index enables O(log n) due-card queries.
 * Dexie types confined here; public signatures use core entities.
 */

import Dexie from 'dexie';
import type { IUserCardRepository } from '@/core/ports/user-card-repository';
import type { UserCard, UserCardId } from '@/core/entities/user-card';
import type { CardId } from '@/core/entities/card';
import type { LexioDB, UserCardRow } from '../database';
import { RepositoryError, NotFoundError } from '../errors';

// ---------------------------------------------------------------------------
// Row ↔ Entity mappers — nextReviewAt stored as epoch ms for index range scans
// ---------------------------------------------------------------------------

function toEntity(row: UserCardRow): UserCard {
  return {
    id: row.id as UserCardId,
    userId: row.userId,
    cardId: row.cardId as CardId,
    deckId: row.deckId as UserCard['deckId'],
    stage: row.stage,
    easeFactor: row.easeFactor,
    intervalDays: row.intervalDays,
    intervalMinutes: row.intervalMinutes,
    repetitions: row.repetitions,
    lapses: row.lapses,
    consecutiveGoods: row.consecutiveGoods,
    nextReviewAt: new Date(row.nextReviewAt).toISOString(),
    isFavorite: row.isFavorite,
    personalNote: row.personalNote,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

function toRow(entity: UserCard): UserCardRow {
  return {
    id: entity.id,
    userId: entity.userId,
    cardId: entity.cardId,
    deckId: entity.deckId,
    stage: entity.stage,
    easeFactor: entity.easeFactor,
    intervalDays: entity.intervalDays,
    intervalMinutes: entity.intervalMinutes,
    repetitions: entity.repetitions,
    lapses: entity.lapses,
    consecutiveGoods: entity.consecutiveGoods,
    nextReviewAt: new Date(entity.nextReviewAt).getTime(),
    isFavorite: entity.isFavorite,
    personalNote: entity.personalNote,
    createdAt: new Date(entity.createdAt).getTime(),
    updatedAt: new Date(entity.updatedAt).getTime(),
  };
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------

export class UserCardRepositoryDexie implements IUserCardRepository {
  constructor(private readonly db: LexioDB) {}

  async findByUserAndCard(userId: string, cardId: CardId): Promise<UserCard | null> {
    try {
      const row = await this.db.userCards
        .where('[userId+stage]')
        .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
        .filter((r) => r.cardId === cardId)
        .first();
      return row ? toEntity(row) : null;
    } catch (err) {
      throw new RepositoryError(`Failed to find user card for user=${userId} card=${cardId}`, err);
    }
  }

  /**
   * Returns cards due at or before `now` using [userId+nextReviewAt] index.
   * `now` is an ISO 8601 string per the port contract.
   */
  async listDue(userId: string, now: string, limit: number): Promise<UserCard[]> {
    try {
      const nowMs = new Date(now).getTime();
      // Compound index lower bound: [userId, 0] — epoch 0 is before any real date
      // Upper bound: [userId, nowMs] — inclusive
      const rows = await this.db.userCards
        .where('[userId+nextReviewAt]')
        .between([userId, 0], [userId, nowMs], true, true)
        .limit(limit)
        .toArray();
      return rows.map(toEntity);
    } catch (err) {
      throw new RepositoryError(`Failed to list due cards for user=${userId}`, err);
    }
  }

  /** Returns New-stage cards using [userId+stage] compound index. */
  async listNew(userId: string, limit: number): Promise<UserCard[]> {
    try {
      const rows = await this.db.userCards
        .where('[userId+stage]')
        .equals([userId, 'New'])
        .limit(limit)
        .toArray();
      return rows.map(toEntity);
    } catch (err) {
      throw new RepositoryError(`Failed to list new cards for user=${userId}`, err);
    }
  }

  async upsert(userCard: UserCard): Promise<UserCard> {
    try {
      await this.db.userCards.put(toRow(userCard));
      return userCard;
    } catch (err) {
      throw new RepositoryError(`Failed to upsert user card: ${userCard.id}`, err);
    }
  }

  async update(id: UserCardId, patch: Partial<Omit<UserCard, 'id'>>): Promise<UserCard> {
    try {
      const existing = await this.db.userCards.get(id);
      if (!existing) throw new NotFoundError('UserCard', id);
      const updated: UserCard = {
        ...toEntity(existing),
        ...patch,
        id,
        updatedAt: new Date().toISOString(),
      };
      await this.db.userCards.put(toRow(updated));
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError(`Failed to update user card: ${id}`, err);
    }
  }
}

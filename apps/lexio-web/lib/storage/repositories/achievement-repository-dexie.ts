/**
 * AchievementRepositoryDexie — Dexie adapter implementing IAchievementRepository.
 * Dexie types confined here; public signatures use core entities.
 */

import type { IAchievementRepository } from '@/core/ports/achievement-repository';
import type { Achievement, AchievementId } from '@/core/entities/achievement';
import type { LexioDB, AchievementRow } from '../database';
import { RepositoryError, DuplicateError } from '../errors';

// ---------------------------------------------------------------------------
// Row ↔ Entity mappers
// ---------------------------------------------------------------------------

function toEntity(row: AchievementRow): Achievement {
  return {
    id: row.id as AchievementId,
    userId: row.userId,
    badgeCode: row.badgeCode,
    earnedAt: new Date(row.earnedAt).toISOString(),
  };
}

function toRow(entity: Achievement): AchievementRow {
  return {
    id: entity.id,
    userId: entity.userId,
    badgeCode: entity.badgeCode,
    earnedAt: new Date(entity.earnedAt).getTime(),
  };
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------

export class AchievementRepositoryDexie implements IAchievementRepository {
  constructor(private readonly db: LexioDB) {}

  async listByUser(userId: string): Promise<Achievement[]> {
    try {
      const rows = await this.db.achievements.where('userId').equals(userId).toArray();
      return rows.map(toEntity);
    } catch (err) {
      throw new RepositoryError(`Failed to list achievements for user: ${userId}`, err);
    }
  }

  /**
   * Awards a badge — no-op if user already holds this badgeCode.
   * Uses [userId+badgeCode] compound index for the existence check.
   */
  async award(userId: string, badgeCode: string): Promise<Achievement> {
    try {
      const existing = await this.db.achievements
        .where('[userId+badgeCode]')
        .equals([userId, badgeCode])
        .first();

      if (existing) {
        // Idempotent: return existing badge rather than throwing
        return toEntity(existing);
      }

      const entity: Achievement = {
        id: crypto.randomUUID() as AchievementId,
        userId,
        badgeCode,
        earnedAt: new Date().toISOString(),
      };
      await this.db.achievements.put(toRow(entity));
      return entity;
    } catch (err) {
      if (err instanceof DuplicateError) throw err;
      throw new RepositoryError(`Failed to award badge ${badgeCode} to user: ${userId}`, err);
    }
  }
}

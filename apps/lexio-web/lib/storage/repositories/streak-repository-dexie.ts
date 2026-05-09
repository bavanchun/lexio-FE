/**
 * StreakRepositoryDexie — Dexie adapter implementing IStreakRepository.
 * Dexie types confined here; public signatures use core entities.
 */

import type { IStreakRepository } from '@/core/ports/streak-repository';
import type { Streak } from '@/core/entities/streak';
import type { LexioDB, StreakRow } from '../database';
import { RepositoryError } from '../errors';

// ---------------------------------------------------------------------------
// Row ↔ Entity mappers — heatmapData stored as JSON object directly in Dexie
// ---------------------------------------------------------------------------

function toEntity(row: StreakRow): Streak {
  return {
    userId: row.userId,
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    lastActiveDate: row.lastActiveDate,
    heatmapData: row.heatmapData,
  };
}

function toRow(entity: Streak): StreakRow {
  return {
    userId: entity.userId,
    currentStreak: entity.currentStreak,
    longestStreak: entity.longestStreak,
    lastActiveDate: entity.lastActiveDate,
    heatmapData: entity.heatmapData,
  };
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------

export class StreakRepositoryDexie implements IStreakRepository {
  constructor(private readonly db: LexioDB) {}

  async findByUser(userId: string): Promise<Streak | null> {
    try {
      const row = await this.db.streaks.get(userId);
      return row ? toEntity(row) : null;
    } catch (err) {
      throw new RepositoryError(`Failed to find streak for user: ${userId}`, err);
    }
  }

  async upsert(streak: Streak): Promise<Streak> {
    try {
      await this.db.streaks.put(toRow(streak));
      return streak;
    } catch (err) {
      throw new RepositoryError(`Failed to upsert streak for user: ${streak.userId}`, err);
    }
  }
}

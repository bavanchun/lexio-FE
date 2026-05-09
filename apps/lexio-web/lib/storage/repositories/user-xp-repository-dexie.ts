/**
 * UserXpRepositoryDexie — Dexie adapter implementing IUserXpRepository.
 * Dexie types confined here; public signatures use core entities.
 */

import type { IUserXpRepository } from '@/core/ports/user-xp-repository';
import type { UserXp } from '@/core/entities/user-xp';
import type { LexioDB, UserXpRow } from '../database';
import { RepositoryError } from '../errors';

// ---------------------------------------------------------------------------
// Row ↔ Entity mappers
// ---------------------------------------------------------------------------

function toEntity(row: UserXpRow): UserXp {
  return {
    userId: row.userId,
    totalXp: row.totalXp,
    level: row.level,
    xpToNext: row.xpToNext,
  };
}

function toRow(entity: UserXp): UserXpRow {
  return {
    userId: entity.userId,
    totalXp: entity.totalXp,
    level: entity.level,
    xpToNext: entity.xpToNext,
  };
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------

export class UserXpRepositoryDexie implements IUserXpRepository {
  constructor(private readonly db: LexioDB) {}

  async findByUser(userId: string): Promise<UserXp | null> {
    try {
      const row = await this.db.userXp.get(userId);
      return row ? toEntity(row) : null;
    } catch (err) {
      throw new RepositoryError(`Failed to find XP record for user: ${userId}`, err);
    }
  }

  async upsert(userXp: UserXp): Promise<UserXp> {
    try {
      await this.db.userXp.put(toRow(userXp));
      return userXp;
    } catch (err) {
      throw new RepositoryError(`Failed to upsert XP for user: ${userXp.userId}`, err);
    }
  }
}

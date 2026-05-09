/**
 * IStreakRepository port — defines the contract for streak persistence.
 * Implemented by lib/storage (Dexie) in phase-05. Pure TS — no framework imports.
 */

import type { Streak } from '../entities/streak';

export interface IStreakRepository {
  findByUser(userId: string): Promise<Streak | null>;
  /** Insert or replace streak record for user. */
  upsert(streak: Streak): Promise<Streak>;
}

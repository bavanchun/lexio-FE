/**
 * IAchievementRepository port — defines the contract for badge persistence.
 * Implemented by lib/storage (Dexie) in phase-05. Pure TS — no framework imports.
 */

import type { Achievement } from '../entities/achievement';

export interface IAchievementRepository {
  listByUser(userId: string): Promise<Achievement[]>;
  /** Award a badge; no-op if user already has this badgeCode. */
  award(userId: string, badgeCode: string): Promise<Achievement>;
}

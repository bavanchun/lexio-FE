/**
 * IUserXpRepository port — defines the contract for XP/level persistence.
 * Implemented by lib/storage (Dexie) in phase-05. Pure TS — no framework imports.
 */

import type { UserXp } from '../entities/user-xp';

export interface IUserXpRepository {
  findByUser(userId: string): Promise<UserXp | null>;
  /** Insert or replace XP record for user. */
  upsert(userXp: UserXp): Promise<UserXp>;
}

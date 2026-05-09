/**
 * IUserCardRepository port — defines the contract for SRS state persistence.
 * Implemented by lib/storage (Dexie) in phase-05. Pure TS — no framework imports.
 */

import type { UserCard, UserCardId } from '../entities/user-card';
import type { CardId } from '../entities/card';

export interface IUserCardRepository {
  findByUserAndCard(userId: string, cardId: CardId): Promise<UserCard | null>;
  /** Returns cards due for review at or before `now`, up to `limit`. */
  listDue(userId: string, now: string, limit: number): Promise<UserCard[]>;
  /** Returns cards in 'New' stage, up to `limit`. */
  listNew(userId: string, limit: number): Promise<UserCard[]>;
  /** Insert or replace the full UserCard record. */
  upsert(userCard: UserCard): Promise<UserCard>;
  update(id: UserCardId, patch: Partial<Omit<UserCard, 'id'>>): Promise<UserCard>;
}

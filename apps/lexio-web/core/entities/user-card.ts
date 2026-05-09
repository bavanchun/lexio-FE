/**
 * UserCard entity — doc §7.2
 * SRS state for a specific user + card pair. Pure TS — no framework imports.
 */

import type { CardId, DeckId } from './card';

export type UserCardId = string & { readonly _brand: 'UserCardId' };

/**
 * Learning stage per SM-2 extended model.
 * New → Learning → Young → Mature
 */
export type Stage = 'New' | 'Learning' | 'Young' | 'Mature';

export interface UserCard {
  id: UserCardId;
  userId: string;
  cardId: CardId;
  deckId: DeckId;
  stage: Stage;
  /** SM-2 ease factor (default 2.5) */
  easeFactor: number;
  /** Review interval in days (used for Young/Mature stages) */
  intervalDays: number;
  /** Review interval in minutes (used for Learning stage) */
  intervalMinutes?: number;
  /** Total successful reviews */
  repetitions: number;
  /** Number of times card reverted to Learning (lapses) */
  lapses: number;
  /** Consecutive correct answers — used for stage promotion */
  consecutiveGoods: number;
  /** ISO 8601 timestamp for next scheduled review */
  nextReviewAt: string;
  isFavorite: boolean;
  personalNote: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

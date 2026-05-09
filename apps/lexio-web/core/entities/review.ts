/**
 * Review entity — doc §7.2
 * A single review event for a UserCard within a Session. Pure TS.
 */

import type { UserCardId } from './user-card';
import type { ExerciseType } from './card';

export type ReviewId = string & { readonly _brand: 'ReviewId' };
export type SessionId = string & { readonly _brand: 'SessionId' };

/**
 * Rating values map to Again / Hard / Good / Easy (SM-2 buttons).
 * 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
 */
export type Rating = 1 | 2 | 3 | 4;

export interface Review {
  id: ReviewId;
  userCardId: UserCardId;
  sessionId: SessionId;
  rating: Rating;
  /** How long the user took to answer, in milliseconds */
  durationMs: number;
  exerciseType: ExerciseType;
  reviewedAt: string; // ISO 8601
}

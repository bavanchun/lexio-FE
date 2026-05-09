/**
 * XP computation — doc §4.4.2
 * Pure function — no side effects, no framework imports.
 *
 * XP per rating (doc §4.4.2):
 *   New card (first review):  +10 base
 *   Again:  2   Hard: 4   Good: 8   Easy: 12
 * Daily goal completion bonus: +50 (caller signals via isDailyGoalReached).
 */

import type { Rating } from '../../entities/review';

/** Base XP awarded per rating (doc §4.4.2). */
const RATING_XP: Record<Rating, number> = {
  1: 2, // Again
  2: 4, // Hard
  3: 8, // Good
  4: 12, // Easy
};

/** Flat XP for introducing a brand-new card (doc §4.4.2 "New = 10"). */
const NEW_CARD_XP = 10;

/** Bonus awarded when the daily review goal is reached (doc §4.4.2). */
const DAILY_GOAL_BONUS = 50;

export interface ComputeXpInput {
  rating: Rating;
  /** True when this is the card's first-ever review (stage was 'New'). */
  isNewCard: boolean;
  /** True when this review completes the user's daily goal. */
  isDailyGoalReached?: boolean;
}

/**
 * Returns the total XP earned for a single review event.
 */
export function computeXp(input: ComputeXpInput): number {
  const { rating, isNewCard, isDailyGoalReached = false } = input;

  const base = isNewCard ? NEW_CARD_XP : RATING_XP[rating];
  const bonus = isDailyGoalReached ? DAILY_GOAL_BONUS : 0;

  return base + bonus;
}

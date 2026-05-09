/**
 * Ease factor update logic — doc §4.3.1
 * Pure function, no side effects.
 */

import type { Rating } from '../../entities/review';

/** Minimum allowed ease factor per SM-2 spec (doc §4.3.1). */
export const EASE_FACTOR_FLOOR = 1.3;

/** Adjustments per rating, doc §4.3.1. */
const EF_DELTA: Record<Rating, number> = {
  1: -0.2, // Again
  2: -0.15, // Hard
  3: 0, // Good
  4: +0.15, // Easy
};

/**
 * Applies SM-2 ease factor delta for the given rating and clamps to floor.
 * No upper cap — per doc §4.3.1 "1.3 – 2.5+" (unbounded above).
 *
 * @param currentEf  - Current ease factor (e.g., 2.5)
 * @param rating     - User rating (1=Again, 2=Hard, 3=Good, 4=Easy)
 * @returns          - Updated ease factor ≥ EASE_FACTOR_FLOOR
 */
export function applyEaseFactor(currentEf: number, rating: Rating): number {
  const updated = currentEf + EF_DELTA[rating];
  return Math.max(EASE_FACTOR_FLOOR, updated);
}

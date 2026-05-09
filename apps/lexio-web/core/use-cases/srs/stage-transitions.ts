/**
 * Stage transition logic — doc §4.3.2
 * Determines the next Stage after a review, based on current stage,
 * rating, consecutive goods count, and new interval.
 * Pure function, no side effects.
 *
 * Transition table (doc §4.3.2):
 *   New      + Good/Easy             → Learning
 *   New      + Easy                  → Young (graduating skip)
 *   Learning + 2 consecutive Goods   → Young
 *   Learning + Easy                  → Young
 *   Young    + interval > 21 days    → Mature
 *   Mature   + Again                 → Learning
 *   Young    + Again                 → Learning (no lapse increment)
 */

import type { Rating } from '../../entities/review';
import type { Stage } from '../../entities/user-card';

export interface StageTransitionInput {
  currentStage: Stage;
  rating: Rating;
  /** consecutiveGoods AFTER the interval-calculator has updated it */
  newConsecutiveGoods: number;
  /** intervalDays AFTER the interval-calculator has computed the new value */
  newIntervalDays: number;
}

/** Days threshold for Young→Mature promotion (doc §4.3.2). */
export const MATURE_THRESHOLD_DAYS = 21;

/**
 * Returns the new stage after applying SM-2 transition rules.
 * The caller must pass the *updated* consecutiveGoods and intervalDays
 * (i.e., values already processed by interval-calculator.ts).
 */
export function transitionStage(input: StageTransitionInput): Stage {
  const { currentStage, rating, newConsecutiveGoods, newIntervalDays } = input;

  switch (currentStage) {
    case 'New':
      return transitionFromNew(rating);

    case 'Learning':
      return transitionFromLearning(rating, newConsecutiveGoods, newIntervalDays);

    case 'Young':
      return transitionFromYoung(rating, newIntervalDays);

    case 'Mature':
      return transitionFromMature(rating);
  }
}

// ── Per-stage helpers ─────────────────────────────────────────────────────────

/** New → Learning on Good; New → Young on Easy (graduating skip). */
function transitionFromNew(rating: Rating): Stage {
  if (rating === 4) return 'Young'; // Easy: graduating skip
  if (rating === 3) return 'Learning'; // Good: enter learning steps
  return 'New'; // Again or Hard: stay New
}

/**
 * Learning → Young when:
 *   - Easy (instant promotion), OR
 *   - 2 consecutive Goods (newConsecutiveGoods >= 2)
 * Learning → Learning otherwise.
 */
function transitionFromLearning(
  rating: Rating,
  newConsecutiveGoods: number,
  // intervalDays not needed for Learning transitions — kept for uniform signature
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _unusedIntervalDays: number,
): Stage {
  if (rating === 1) return 'Learning'; // Again stays Learning
  if (rating === 4) return 'Young'; // Easy instant promotion
  if (rating === 2) return 'Learning'; // Hard stays Learning
  // Good: promote after 2 consecutive goods
  if (newConsecutiveGoods >= 2) return 'Young';
  return 'Learning';
}

/**
 * Young → Mature when new interval exceeds MATURE_THRESHOLD_DAYS.
 * Young → Learning on Again (no lapse, handled in calculate-next-review).
 */
function transitionFromYoung(rating: Rating, newIntervalDays: number): Stage {
  if (rating === 1) return 'Learning'; // demote
  if (newIntervalDays > MATURE_THRESHOLD_DAYS) return 'Mature';
  return 'Young';
}

/** Mature → Learning on Again (lapses++ handled by caller). */
function transitionFromMature(rating: Rating): Stage {
  if (rating === 1) return 'Learning';
  return 'Mature';
}

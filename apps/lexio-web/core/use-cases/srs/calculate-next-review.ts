/**
 * calculate-next-review — doc §4.3.1
 * Orchestrates ease factor, interval, and stage transition to produce
 * the next UserCard state after a single review. Pure function — zero
 * framework/browser imports. Injected `now` makes tests deterministic.
 *
 * Algorithm reference: SM-2 (Wozniak 1987) as adapted in doc §4.3.
 */

import type { UserCard } from '../../entities/user-card';
import type { Rating } from '../../entities/review';
import { applyEaseFactor } from './ease-factor';
import { calculateInterval } from './interval-calculator';
import { transitionStage } from './stage-transitions';

// ── Public types ──────────────────────────────────────────────────────────────

export interface ReviewInput {
  /** Current SRS state of the card (will NOT be mutated). */
  userCard: UserCard;
  /** 1=Again  2=Hard  3=Good  4=Easy */
  rating: Rating;
  /** Injected timestamp — use `new Date()` in production, fixed date in tests. */
  now: Date;
}

export interface ReviewOutput {
  /** New UserCard — immutable copy with updated SRS fields. */
  userCard: UserCard;
  /** True when intervalDays changed from the previous value. */
  intervalChanged: boolean;
  /** True when stage changed from the previous value. */
  stageTransitioned: boolean;
}

// ── Main entry point ──────────────────────────────────────────────────────────

/**
 * Computes the next SRS state for a card after a user rating.
 *
 * Steps (doc §4.3.1):
 *   1. Update ease factor (floor 1.3, no upper cap).
 *   2. Compute new interval (stage-aware, sub-day for Learning).
 *   3. Update repetitions and consecutiveGoods counters.
 *   4. Increment lapses when Mature card is rated Again (doc §4.3.2).
 *   5. Determine new stage via transition rules (doc §4.3.2).
 *   6. Calculate nextReviewAt = now + intervalDays * 86 400 000 ms
 *      (or intervalMinutes * 60 000 ms for sub-day Learning steps).
 */
export function calculateNextReview(input: ReviewInput): ReviewOutput {
  const { userCard, rating, now } = input;
  const prevStage = userCard.stage;
  const prevIntervalDays = userCard.intervalDays;

  // ── Step 1: ease factor ────────────────────────────────────────────────────
  // Again on Mature also decrements EF (researcher-b §Mature).
  const newEaseFactor = applyEaseFactor(userCard.easeFactor, rating);

  // ── Step 2: interval ───────────────────────────────────────────────────────
  const intervalResult = calculateInterval({
    stage: userCard.stage,
    rating,
    intervalDays: userCard.intervalDays,
    intervalMinutes: userCard.intervalMinutes,
    repetitions: userCard.repetitions,
    consecutiveGoods: userCard.consecutiveGoods,
    easeFactor: newEaseFactor,
  });

  // ── Step 3: counters ───────────────────────────────────────────────────────
  const newRepetitions = intervalResult.resetRepetitions ? 0 : userCard.repetitions + 1;

  let newConsecutiveGoods: number;
  if (intervalResult.resetConsecutiveGoods) {
    newConsecutiveGoods = 0;
  } else if (intervalResult.incrementConsecutiveGoods) {
    newConsecutiveGoods = userCard.consecutiveGoods + 1;
  } else {
    newConsecutiveGoods = userCard.consecutiveGoods;
  }

  // ── Step 4: lapses — only Mature + Again (doc §4.3.2) ─────────────────────
  const newLapses = prevStage === 'Mature' && rating === 1 ? userCard.lapses + 1 : userCard.lapses;

  // ── Step 5: stage transition ───────────────────────────────────────────────
  const newStage = transitionStage({
    currentStage: prevStage,
    rating,
    newConsecutiveGoods,
    newIntervalDays: intervalResult.intervalDays,
  });

  // ── Step 6: next review timestamp ─────────────────────────────────────────
  const nextReviewAt = computeNextReviewAt(
    now,
    intervalResult.intervalDays,
    intervalResult.intervalMinutes,
  );

  // ── Assemble output ────────────────────────────────────────────────────────
  const updatedCard: UserCard = {
    ...userCard,
    stage: newStage,
    easeFactor: newEaseFactor,
    intervalDays: intervalResult.intervalDays,
    intervalMinutes: intervalResult.intervalMinutes,
    repetitions: newRepetitions,
    consecutiveGoods: newConsecutiveGoods,
    lapses: newLapses,
    nextReviewAt: nextReviewAt.toISOString(),
    updatedAt: now.toISOString(),
  };

  return {
    userCard: updatedCard,
    intervalChanged: intervalResult.intervalDays !== prevIntervalDays,
    stageTransitioned: newStage !== prevStage,
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Calculates the next review timestamp.
 * Sub-day Learning steps use intervalMinutes; graduated intervals use intervalDays.
 */
function computeNextReviewAt(
  now: Date,
  intervalDays: number,
  intervalMinutes: number | undefined,
): Date {
  if (intervalMinutes !== undefined && intervalDays === 0) {
    // Sub-day Learning step (doc §4.3.1 "10 minute step")
    return new Date(now.getTime() + intervalMinutes * 60_000);
  }
  // Day-based interval — multiply by ms per day
  return new Date(now.getTime() + intervalDays * 86_400_000);
}

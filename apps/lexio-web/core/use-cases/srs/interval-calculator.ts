/**
 * Interval calculation — doc §4.3.1
 * Stage-aware interval logic. Pure function, no side effects.
 */

import type { Rating } from '../../entities/review';
import type { Stage } from '../../entities/user-card';

export interface IntervalInput {
  stage: Stage;
  rating: Rating;
  intervalDays: number;
  intervalMinutes: number | undefined;
  repetitions: number;
  consecutiveGoods: number;
  easeFactor: number;
}

export interface IntervalOutput {
  /** Day-based interval (used for Young/Mature and Learning day steps) */
  intervalDays: number;
  /** Minute-based interval for sub-day Learning steps */
  intervalMinutes?: number;
  /** Whether repetitions should be reset to 0 */
  resetRepetitions: boolean;
  /** Whether consecutive goods counter should be reset */
  resetConsecutiveGoods: boolean;
  /** Whether consecutive goods counter should be incremented */
  incrementConsecutiveGoods: boolean;
}

/** Sub-day Learning step: 10 minutes (doc §4.3.1 / researcher-b) */
const LEARNING_STEP_MINUTES = 10;

/**
 * Computes next interval based on current stage and rating.
 * Returns both day and minute intervals so caller can store appropriately.
 * doc §4.3.1, researcher-b "Interval calculation (per stage)"
 */
export function calculateInterval(input: IntervalInput): IntervalOutput {
  const { stage, rating, intervalDays, repetitions, consecutiveGoods, easeFactor } = input;

  switch (stage) {
    case 'New':
      return calculateNewInterval(rating);

    case 'Learning':
      return calculateLearningInterval(rating, intervalDays, consecutiveGoods, easeFactor);

    case 'Young':
      return calculateYoungInterval(rating, intervalDays, easeFactor);

    case 'Mature':
      return calculateMatureInterval(rating, intervalDays, repetitions, easeFactor);
  }
}

// ── New card ──────────────────────────────────────────────────────────────────

function calculateNewInterval(rating: Rating): IntervalOutput {
  switch (rating) {
    case 1: // Again — stay New, re-queue at session end; keep interval=0
      return noChange(0, LEARNING_STEP_MINUTES, true, true, false);

    case 2: // Hard — stay New/Learning with sub-day step
      return noChange(0, LEARNING_STEP_MINUTES, false, false, false);

    case 3: // Good — transition to Learning, interval = 1 day, repetitions=1
      return {
        intervalDays: 1,
        intervalMinutes: undefined,
        resetRepetitions: false,
        resetConsecutiveGoods: false,
        incrementConsecutiveGoods: true,
      };

    case 4: // Easy — graduating skip to Young, interval = 4 days
      return {
        intervalDays: 4,
        intervalMinutes: undefined,
        resetRepetitions: false,
        resetConsecutiveGoods: false,
        incrementConsecutiveGoods: false,
      };
  }
}

// ── Learning card ─────────────────────────────────────────────────────────────

function calculateLearningInterval(
  rating: Rating,
  currentIntervalDays: number,
  consecutiveGoods: number,
  // easeFactor not used in Learning — kept for uniform signature across stage handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _easeFactor: number,
): IntervalOutput {
  switch (rating) {
    case 1: // Again — stay Learning, 10min step, reset
      return noChange(0, LEARNING_STEP_MINUTES, true, true, false);

    case 2: {
      // Hard — multiply by 1.2, min 1 day, stay Learning
      const next = Math.max(1, Math.round(currentIntervalDays * 1.2));
      return {
        intervalDays: next,
        intervalMinutes: undefined,
        resetRepetitions: false,
        resetConsecutiveGoods: true,
        incrementConsecutiveGoods: false,
      };
    }

    case 3: {
      // Good — track consecutive goods for Young transition
      // First Good after entering Learning: interval = 1d
      // Second consecutive Good: interval = 3d → then stage-transitions promotes to Young
      const isSecondGood = consecutiveGoods >= 1;
      const next = isSecondGood ? 3 : 1;
      return {
        intervalDays: next,
        intervalMinutes: undefined,
        resetRepetitions: false,
        resetConsecutiveGoods: false,
        incrementConsecutiveGoods: true,
      };
    }

    case 4: {
      // Easy — jump to Young
      const next = Math.max(4, Math.round(currentIntervalDays * 2.5));
      return {
        intervalDays: next,
        intervalMinutes: undefined,
        resetRepetitions: false,
        resetConsecutiveGoods: false,
        incrementConsecutiveGoods: false,
      };
    }
  }
}

// ── Young card ────────────────────────────────────────────────────────────────

function calculateYoungInterval(
  rating: Rating,
  currentIntervalDays: number,
  easeFactor: number,
): IntervalOutput {
  switch (rating) {
    case 1: // Again — demote to Learning, no lapse increment (doc §4.3.2)
      return noChange(0, LEARNING_STEP_MINUTES, true, true, false);

    case 2: {
      // Hard
      const next = Math.max(1, Math.round(currentIntervalDays * 1.2));
      return {
        intervalDays: next,
        intervalMinutes: undefined,
        resetRepetitions: false,
        resetConsecutiveGoods: true,
        incrementConsecutiveGoods: false,
      };
    }

    case 3: {
      // Good
      const next = Math.round(currentIntervalDays * easeFactor);
      return {
        intervalDays: next,
        intervalMinutes: undefined,
        resetRepetitions: false,
        resetConsecutiveGoods: false,
        incrementConsecutiveGoods: false,
      };
    }

    case 4: {
      // Easy
      const next = Math.round(currentIntervalDays * easeFactor * 1.3);
      return {
        intervalDays: next,
        intervalMinutes: undefined,
        resetRepetitions: false,
        resetConsecutiveGoods: false,
        incrementConsecutiveGoods: false,
      };
    }
  }
}

// ── Mature card ───────────────────────────────────────────────────────────────

function calculateMatureInterval(
  rating: Rating,
  currentIntervalDays: number,
  _repetitions: number,
  easeFactor: number,
): IntervalOutput {
  switch (rating) {
    case 1: // Again — lapses++ handled in calculate-next-review.ts
      return noChange(0, LEARNING_STEP_MINUTES, true, true, false);

    case 2: {
      // Hard — at least +1 day (doc researcher-b §Mature)
      const next = Math.max(currentIntervalDays + 1, Math.round(currentIntervalDays * 1.2));
      return {
        intervalDays: next,
        intervalMinutes: undefined,
        resetRepetitions: false,
        resetConsecutiveGoods: true,
        incrementConsecutiveGoods: false,
      };
    }

    case 3: {
      // Good
      const next = Math.round(currentIntervalDays * easeFactor);
      return {
        intervalDays: next,
        intervalMinutes: undefined,
        resetRepetitions: false,
        resetConsecutiveGoods: false,
        incrementConsecutiveGoods: false,
      };
    }

    case 4: {
      // Easy
      const next = Math.round(currentIntervalDays * easeFactor * 1.3);
      return {
        intervalDays: next,
        intervalMinutes: undefined,
        resetRepetitions: false,
        resetConsecutiveGoods: false,
        incrementConsecutiveGoods: false,
      };
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function noChange(
  intervalDays: number,
  intervalMinutes: number,
  resetRepetitions: boolean,
  resetConsecutiveGoods: boolean,
  incrementConsecutiveGoods: boolean,
): IntervalOutput {
  return {
    intervalDays,
    intervalMinutes,
    resetRepetitions,
    resetConsecutiveGoods,
    incrementConsecutiveGoods,
  };
}

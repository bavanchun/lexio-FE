/**
 * Session queue builder with adaptive new-card cap — doc §4.3.3
 * Pure functions — no side effects, no framework imports.
 *
 * Adaptive cap algorithm (doc §4.3.3):
 *   1. dueToday > 200  → cap = 0                          (highest priority)
 *   2. dueToday > 100  → cap = max(5, floor(target * 0.5))
 *   3. retention7d < 0.80 → cap = floor(target * 0.7)
 *   4. otherwise        → cap = target
 * Rules are applied in priority order — first matching rule wins.
 */

import type { UserCard } from '../../entities/user-card';

// ── Adaptive cap ──────────────────────────────────────────────────────────────

export interface NewCardCapInput {
  /** Total number of cards due today (drives throttle logic). */
  dueTodayCount: number;
  /** User's configured daily new-card target (default 15). */
  baseTarget: number;
  /** 7-day retention rate expressed as a fraction 0.0–1.0. */
  retention7d: number;
}

/**
 * Computes the maximum number of new cards to introduce this session.
 * Priority order: 200-cap > 100-cap > retention-cap > no-cap.
 */
export function computeNewCardCap(input: NewCardCapInput): number {
  const { dueTodayCount, baseTarget, retention7d } = input;

  // Priority 1 — review pile too deep, pause new cards entirely
  if (dueTodayCount > 200) return 0;

  // Priority 2 — pile above 100, halve new cards (minimum 5)
  if (dueTodayCount > 100) return Math.max(5, Math.floor(baseTarget * 0.5));

  // Priority 3 — retention below 80%, slow down new cards
  if (retention7d < 0.8) return Math.floor(baseTarget * 0.7);

  // Default — no throttling
  return baseTarget;
}

// ── Session queue ─────────────────────────────────────────────────────────────

export interface SessionQueueInput {
  /** Cards already due (sorted oldest first by caller). */
  dueCards: UserCard[];
  /** New cards available for introduction (not yet seen). */
  newCards: UserCard[];
  /** Total count of due cards today (used for adaptive cap). */
  dueTodayCount: number;
  /** 7-day retention rate (0.0–1.0). */
  retention7d: number;
  /** User's new-card target per session (default 15). */
  target: number;
}

export interface SessionQueueOutput {
  /** Due cards to review — unchanged order. */
  dueQueue: UserCard[];
  /** Capped slice of new cards to introduce this session. */
  newQueue: UserCard[];
  /** The computed cap that was applied. */
  appliedNewLimit: number;
}

/**
 * Builds the ordered session queue applying the adaptive new-card cap.
 * Due cards are returned as-is (caller handles ordering).
 * New cards are sliced to the computed cap.
 */
export function getSessionQueue(input: SessionQueueInput): SessionQueueOutput {
  const { dueCards, newCards, dueTodayCount, retention7d, target } = input;

  const cap = computeNewCardCap({ dueTodayCount, baseTarget: target, retention7d });
  const appliedNewLimit = Math.min(cap, newCards.length);

  return {
    dueQueue: dueCards,
    newQueue: newCards.slice(0, appliedNewLimit),
    appliedNewLimit,
  };
}

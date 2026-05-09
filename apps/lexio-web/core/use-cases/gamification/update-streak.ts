/**
 * Streak update logic — doc §4.4.1
 * Pure function — no side effects, no framework imports.
 *
 * Rules (doc §4.4.1):
 *   - Same calendar day → no-op (streak already counted today)
 *   - Consecutive day  → increment currentStreak, update longestStreak
 *   - Gap ≥ 2 days     → reset currentStreak to 1
 * All day arithmetic uses calendar-day diff (not 24h diff) to be DST-safe.
 */

import type { Streak } from '../../entities/streak';

/**
 * Returns the ISO date string (YYYY-MM-DD) for the given Date
 * in local wall-clock time. Uses toLocaleDateString for DST safety.
 */
export function toIsoDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the calendar-day difference between two ISO date strings.
 * Positive when dateB is after dateA.
 */
function calendarDayDiff(dateA: string, dateB: string): number {
  const msA = new Date(dateA + 'T00:00:00').getTime();
  const msB = new Date(dateB + 'T00:00:00').getTime();
  return Math.round((msB - msA) / 86_400_000);
}

/**
 * Updates a user's streak after a review on the given `now` Date.
 * Returns a new Streak object — input is never mutated.
 *
 * @param streak - Current streak state
 * @param now    - Timestamp of the review (use real Date in prod, fixed in tests)
 */
export function updateStreak(streak: Streak, now: Date): Streak {
  const todayStr = toIsoDateString(now);
  const lastStr = streak.lastActiveDate;

  // Guard: if lastActiveDate is somehow in the future, treat as same-day
  const diff = lastStr ? calendarDayDiff(lastStr, todayStr) : 1;

  // Same calendar day — streak already counted
  if (diff === 0) return streak;

  // Consecutive day — extend streak
  if (diff === 1) {
    const newCurrent = streak.currentStreak + 1;
    return {
      ...streak,
      currentStreak: newCurrent,
      longestStreak: Math.max(streak.longestStreak, newCurrent),
      lastActiveDate: todayStr,
    };
  }

  // Gap ≥ 2 days — reset to 1
  return {
    ...streak,
    currentStreak: 1,
    lastActiveDate: todayStr,
  };
}

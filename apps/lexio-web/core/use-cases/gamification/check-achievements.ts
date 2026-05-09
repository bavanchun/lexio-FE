/**
 * Achievement / badge checker — doc §4.4.4
 * Pure function — no side effects, no framework imports.
 *
 * Badge codes (doc §4.4.4):
 *   first_steps      — first review ever completed
 *   week_warrior     — 7-day streak reached
 *   month_master     — 30-day streak reached
 *   century_club     — 100 cards mastered
 *   kilo_crusher     — 1000 cards mastered
 *   speed_demon      — session accuracy ≥ 90% with ≥ 10 reviews
 *   perfect_day      — daily goal hit with 100% Good/Easy (0 Again)
 *   comeback_kid     — reviewed after ≥ 2-day gap (streak was reset)
 *   polyglot_path    — 5 decks created (stub — deck count out of scope for prototype)
 */

export interface AchievementContext {
  /** Badge codes the user already holds — prevents re-awarding. */
  earnedBadgeCodes: string[];
  /** Total reviews ever completed (including this session). */
  totalReviews: number;
  /** Current streak length after today's update. */
  currentStreak: number;
  /** Number of cards in Mature stage (proxy for "mastered"). */
  masteredCount: number;
  /** Accuracy of the current session: ratio of Good+Easy to total (0.0–1.0). */
  sessionAccuracy: number;
  /** Number of reviews in the current session. */
  sessionReviewCount: number;
  /** True when the user hit their daily review goal today. */
  isDailyGoalReached: boolean;
  /** True when the user had a gap ≥ 2 days before today's review. */
  isComeback: boolean;
  /** Number of decks the user has created (stub for polyglot_path). */
  deckCount: number;
}

/** Badge definitions: code + predicate. Order is irrelevant — all are checked. */
const BADGE_PREDICATES: Array<{ code: string; check: (ctx: AchievementContext) => boolean }> = [
  {
    code: 'first_steps',
    check: (ctx) => ctx.totalReviews >= 1,
  },
  {
    code: 'week_warrior',
    check: (ctx) => ctx.currentStreak >= 7,
  },
  {
    code: 'month_master',
    check: (ctx) => ctx.currentStreak >= 30,
  },
  {
    code: 'century_club',
    check: (ctx) => ctx.masteredCount >= 100,
  },
  {
    code: 'kilo_crusher',
    check: (ctx) => ctx.masteredCount >= 1000,
  },
  {
    code: 'speed_demon',
    check: (ctx) => ctx.sessionReviewCount >= 10 && ctx.sessionAccuracy >= 0.9,
  },
  {
    code: 'perfect_day',
    check: (ctx) => ctx.isDailyGoalReached && ctx.sessionAccuracy === 1.0,
  },
  {
    code: 'comeback_kid',
    check: (ctx) => ctx.isComeback,
  },
  {
    code: 'polyglot_path',
    check: (ctx) => ctx.deckCount >= 5,
  },
];

/**
 * Returns badge codes for achievements newly earned in this context.
 * Already-earned badges (via earnedBadgeCodes) are excluded to prevent duplicates.
 */
export function checkAchievements(ctx: AchievementContext): string[] {
  const alreadyEarned = new Set(ctx.earnedBadgeCodes);
  return BADGE_PREDICATES.filter((badge) => !alreadyEarned.has(badge.code) && badge.check(ctx)).map(
    (badge) => badge.code,
  );
}

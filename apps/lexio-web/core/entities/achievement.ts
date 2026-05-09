/**
 * Achievement entity — doc §7.2
 * Badge awarded to a user for reaching a milestone. Pure TS — no framework imports.
 */

export type AchievementId = string & { readonly _brand: 'AchievementId' };

export interface Achievement {
  id: AchievementId;
  userId: string;
  /** Stable badge identifier, e.g. "streak_7", "cards_100" */
  badgeCode: string;
  earnedAt: string; // ISO 8601
}

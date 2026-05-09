/**
 * UserXp entity — doc §7.2
 * Gamification XP/level tracking per user. Pure TS — no framework imports.
 */

export interface UserXp {
  userId: string;
  totalXp: number;
  level: number;
  /** XP needed to reach the next level */
  xpToNext: number;
}

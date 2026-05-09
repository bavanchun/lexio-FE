/**
 * Gamification use-cases barrel — doc §4.4
 * Re-exports all public gamification functions and types.
 */

export { computeXp } from './compute-xp';
export type { ComputeXpInput } from './compute-xp';

export { xpRequiredForLevel, levelFromTotalXp, xpToNextLevel } from './compute-level';

export { updateStreak, toIsoDateString } from './update-streak';

export { checkAchievements } from './check-achievements';
export type { AchievementContext } from './check-achievements';

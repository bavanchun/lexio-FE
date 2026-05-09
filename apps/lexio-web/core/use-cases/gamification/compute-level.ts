/**
 * Level computation — doc §4.4.2
 * Quadratic XP curve: xp_required(n) = 100 * n^1.5
 * Pure functions — no side effects, no framework imports.
 */

/** XP required to reach level n from level n-1 (cumulative threshold at level n). */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0; // level 1 starts at 0 XP
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

/**
 * Derives current level from total accumulated XP.
 * Starts at level 1 (0 XP). Increments while cumulative threshold is met.
 */
export function levelFromTotalXp(totalXp: number): number {
  let level = 1;
  // Each iteration checks whether the user has enough XP for the next level
  while (totalXp >= xpRequiredForLevel(level + 1)) {
    level += 1;
  }
  return level;
}

/**
 * Returns XP needed to advance from the current level to the next.
 * Useful for progress-bar rendering.
 */
export function xpToNextLevel(totalXp: number): number {
  const currentLevel = levelFromTotalXp(totalXp);
  const nextThreshold = xpRequiredForLevel(currentLevel + 1);
  return Math.max(0, nextThreshold - totalXp);
}

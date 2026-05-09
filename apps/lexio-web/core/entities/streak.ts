/**
 * Streak entity — doc §7.2
 * Tracks daily study consistency per user. Pure TS — no framework imports.
 */

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  /** ISO date string (YYYY-MM-DD) of the last day the user studied */
  lastActiveDate: string;
  /**
   * Heatmap data: keys are ISO date strings (YYYY-MM-DD),
   * values are the number of cards reviewed that day.
   */
  heatmapData: Record<string, number>;
}

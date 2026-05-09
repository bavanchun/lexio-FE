/**
 * statistics feature public barrel.
 * External code (app/ routes) imports from here — not from internal paths.
 *
 * eslint-disable boundaries/dependencies: intra-feature re-exports are intentional.
 * boundaries/checkInternals:true treats all features/** as same type, so same-feature
 * barrel re-exports require suppression.
 */
/* eslint-disable boundaries/dependencies */
export { DashboardClient } from './components/dashboard-client';
export { AchievementsGrid } from './components/achievements-grid';
export { Heatmap } from './components/heatmap';
export {
  useDashboardStats,
  useHeatmap,
  useAchievements,
  useRetention,
  CANONICAL_BADGES,
} from './services/stats-queries';
export type {
  DashboardStats,
  HeatmapData,
  AchievementsData,
  EarnedBadge,
  AchievementBadge,
} from './services/stats-queries';
/* eslint-enable boundaries/dependencies */

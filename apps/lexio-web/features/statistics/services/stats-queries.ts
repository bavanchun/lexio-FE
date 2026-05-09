'use client';

/**
 * TanStack Query hooks for the statistics feature.
 * Reads streak, XP, achievements, and today's card counts from the API client.
 * All hooks require a non-empty userId to enable.
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient, queryKeys } from '@/lib/api';

// ---------------------------------------------------------------------------
// Dashboard stats — composes streak + XP + today's card queue counts
// ---------------------------------------------------------------------------

export interface DashboardStats {
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string;
  };
  xp: {
    totalXp: number;
    level: number;
    xpToNext: number;
  };
  todayDueCount: number;
  todayNewCount: number;
  /** Estimated minutes: due×(10/60) + new×(30/60) */
  estimatedMinutes: number;
}

export function useDashboardStats(userId: string) {
  return useQuery({
    queryKey: queryKeys.stats.dashboard(userId),
    enabled: Boolean(userId),
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date().toISOString();
      const [streak, xp, dueCards, newCards] = await Promise.all([
        apiClient.stats.getStreak(userId),
        apiClient.stats.getXp(userId),
        apiClient.userCards.getDueQueue(userId, now, 200),
        apiClient.userCards.getNewQueue(userId, 200),
      ]);

      const todayDueCount = dueCards.length;
      const todayNewCount = newCards.length;
      // 10 seconds per due card, 30 seconds per new card — convert to minutes
      const estimatedMinutes = Math.ceil((todayDueCount * 10 + todayNewCount * 30) / 60);

      return {
        streak: {
          current: streak?.currentStreak ?? 0,
          longest: streak?.longestStreak ?? 0,
          lastActiveDate: streak?.lastActiveDate ?? '',
        },
        xp: {
          totalXp: xp?.totalXp ?? 0,
          level: xp?.level ?? 1,
          xpToNext: xp?.xpToNext ?? 100,
        },
        todayDueCount,
        todayNewCount,
        estimatedMinutes,
      };
    },
  });
}

// ---------------------------------------------------------------------------
// Heatmap — returns daily review counts for the given date range
// ---------------------------------------------------------------------------

/** Daily review counts keyed by ISO date (YYYY-MM-DD). */
export type HeatmapData = Record<string, number>;

export function useHeatmap(userId: string, fromDate: string, toDate: string) {
  return useQuery({
    queryKey: queryKeys.stats.heatmap(userId, fromDate, toDate),
    enabled: Boolean(userId) && Boolean(fromDate) && Boolean(toDate),
    queryFn: async (): Promise<HeatmapData> => {
      const streak = await apiClient.stats.getStreak(userId);
      if (!streak?.heatmapData) return {};

      // Filter to the requested date range
      const from = fromDate;
      const to = toDate;
      const filtered: HeatmapData = {};
      for (const [iso, count] of Object.entries(streak.heatmapData)) {
        if (iso >= from && iso <= to) {
          filtered[iso] = count;
        }
      }
      return filtered;
    },
  });
}

// ---------------------------------------------------------------------------
// Achievements — separates earned badges from the canonical locked list
// ---------------------------------------------------------------------------

export interface AchievementBadge {
  code: string;
  name: string;
  trigger: string;
}

/** Canonical badge list per §4.4.4. */
export const CANONICAL_BADGES: AchievementBadge[] = [
  { code: 'first_steps', name: 'First steps', trigger: 'Complete your first review' },
  { code: 'week_warrior', name: 'Week warrior', trigger: 'Maintain a 7-day streak' },
  { code: 'month_master', name: 'Month master', trigger: 'Maintain a 30-day streak' },
  { code: 'century_club', name: 'Century club', trigger: 'Master 100 cards' },
  { code: 'kilo_crusher', name: 'Kilo crusher', trigger: 'Master 1,000 cards' },
  { code: 'polyglot_path', name: 'Polyglot path', trigger: 'Create 5 decks' },
  { code: 'sharing_is_caring', name: 'Sharing is caring', trigger: 'Share your first public deck' },
  { code: 'speed_demon', name: 'Speed demon', trigger: 'Complete 100 reviews in one session' },
  { code: 'perfect_day', name: 'Perfect day', trigger: '100% accuracy in a session of 10+ cards' },
  { code: 'comeback_kid', name: 'Comeback kid', trigger: 'Restore a streak after a break' },
];

export interface EarnedBadge extends AchievementBadge {
  earnedAt: string;
}

export interface AchievementsData {
  earned: EarnedBadge[];
  locked: AchievementBadge[];
}

export function useAchievements(userId: string) {
  return useQuery({
    queryKey: queryKeys.stats.achievements(userId),
    enabled: Boolean(userId),
    queryFn: async (): Promise<AchievementsData> => {
      const achievements = await apiClient.stats.getAchievements(userId);
      const earnedCodes = new Set(achievements.map((a) => a.badgeCode));

      const earned: EarnedBadge[] = achievements
        .map((a) => {
          const badge = CANONICAL_BADGES.find((b) => b.code === a.badgeCode);
          if (!badge) return null;
          return { ...badge, earnedAt: a.earnedAt };
        })
        .filter((b): b is EarnedBadge => b !== null);

      const locked = CANONICAL_BADGES.filter((b) => !earnedCodes.has(b.code));

      return { earned, locked };
    },
  });
}

// ---------------------------------------------------------------------------
// Retention — placeholder (real calc deferred, see §5.6 of the product spec)
// ---------------------------------------------------------------------------

export interface RetentionData {
  retentionRate: number; // 0-100 percentage
}

/**
 * Placeholder retention hook — returns a fixed value until real retention
 * calculation (doc §5.6: rolling 30-day retention based on review history)
 * is implemented.
 */
export function useRetention(_userId: string) {
  return useQuery({
    queryKey: ['stats', _userId, 'retention'],
    enabled: false, // disabled until real calc is implemented (§5.6)
    queryFn: async (): Promise<RetentionData> => {
      return { retentionRate: 0 };
    },
  });
}

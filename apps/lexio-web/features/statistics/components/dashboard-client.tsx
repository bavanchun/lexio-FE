'use client';

/**
 * DashboardClient — client-side dashboard shell.
 * Fetches stats via TanStack Query hooks, renders today/streak/XP cards,
 * lazy-loaded heatmap, and top-4 achievements.
 *
 * Lazy-loaded heatmap is imported via next/dynamic (ssr:false) to keep it
 * out of the initial JS bundle (NFR: ≤180 KB for initial dashboard load).
 */
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { getGreeting } from '@/shared/lib/greeting';
// eslint-disable-next-line boundaries/dependencies
import { useDashboardStats } from '../services/stats-queries';
// eslint-disable-next-line boundaries/dependencies
import { useHeatmap } from '../services/stats-queries';
// eslint-disable-next-line boundaries/dependencies
import { useAchievements } from '../services/stats-queries';
// eslint-disable-next-line boundaries/dependencies
import { StreakCard } from './streak-card';
// eslint-disable-next-line boundaries/dependencies
import { XpCard } from './xp-card';
// eslint-disable-next-line boundaries/dependencies
import { TodayCard } from './today-card';
// eslint-disable-next-line boundaries/dependencies
import { AchievementsGrid } from './achievements-grid';

// ---------------------------------------------------------------------------
// Lazy-loaded heatmap — excluded from initial bundle per NFR §6 / phase-09
// ---------------------------------------------------------------------------

const HeatmapSkeleton = () => <Skeleton className="h-36 w-full rounded-md" />;

const Heatmap = dynamic(
  // eslint-disable-next-line boundaries/dependencies
  () => import('./heatmap').then((m) => ({ default: m.Heatmap })),
  { ssr: false, loading: HeatmapSkeleton },
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Stub deck ID — matches STUB_DECK_ID in lib/storage/seed-loader.ts.
 *  features/ cannot import lib/ directly per boundary rules. */
const STUB_DECK_ID = 'seed-deck-it-tech-001';

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DashboardClientProps {
  userId: string;
  displayName: string;
}

export function DashboardClient({ userId, displayName }: DashboardClientProps) {
  const greeting = getGreeting();

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setDate(yearAgo.getDate() - 364);
  const fromDate = toIso(yearAgo);
  const toDate = toIso(today);

  const stats = useDashboardStats(userId);
  const heatmap = useHeatmap(userId, fromDate, toDate);
  const achievements = useAchievements(userId);

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          {greeting}, {displayName}
        </p>
      </div>

      {/* Top stats row: Today | Streak | XP */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.isPending ? (
          <>
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </>
        ) : stats.isError ? (
          <p className="col-span-3 text-sm text-destructive">
            Failed to load stats. Try refreshing.
          </p>
        ) : (
          <>
            <TodayCard
              dueCount={stats.data.todayDueCount}
              newCount={stats.data.todayNewCount}
              estimatedMinutes={stats.data.estimatedMinutes}
              deckId={STUB_DECK_ID}
            />
            <StreakCard current={stats.data.streak.current} longest={stats.data.streak.longest} />
            <XpCard
              level={stats.data.xp.level}
              totalXp={stats.data.xp.totalXp}
              xpToNext={stats.data.xp.xpToNext}
            />
          </>
        )}
      </div>

      {/* Activity heatmap */}
      <section aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="mb-3 text-lg font-medium">
          Activity
        </h2>
        {heatmap.isPending ? (
          <HeatmapSkeleton />
        ) : heatmap.isError ? (
          <p className="text-sm text-destructive">Failed to load heatmap.</p>
        ) : (
          <Heatmap data={heatmap.data} toDate={toDate} />
        )}
      </section>

      {/* Achievements — top 4 with "View all" link */}
      <section aria-labelledby="achievements-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="achievements-heading" className="text-lg font-medium">
            Achievements
          </h2>
          <Link
            href="/stats"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
        {achievements.isPending ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : achievements.isError ? (
          <p className="text-sm text-destructive">Failed to load achievements.</p>
        ) : (
          <AchievementsGrid
            earned={achievements.data.earned}
            locked={achievements.data.locked}
            limit={4}
          />
        )}
      </section>
    </div>
  );
}

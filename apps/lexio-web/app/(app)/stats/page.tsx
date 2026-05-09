'use client';

/**
 * /stats — full statistics page (phase-09).
 * Shows full 365-day heatmap + complete achievements grid + retention placeholder.
 * Client component: reads auth store for userId.
 *
 * app/ → features/ is allowed per ESLint boundaries rules.
 */
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/features/auth';
import { useHeatmap, useAchievements } from '@/features/statistics';
import { AchievementsGrid } from '@/features/statistics';
import { Skeleton } from '@/shared/components/ui/skeleton';

/** Stub user ID — matches seed-loader.ts. app/ cannot import lib/ directly. */
const FALLBACK_USER_ID = 'stub-user-000';

// Lazy-load heatmap (ssr:false) to keep initial bundle lean
const Heatmap = dynamic(
  () => import('@/features/statistics').then((m) => ({ default: m.Heatmap })),
  { ssr: false, loading: () => <Skeleton className="h-36 w-full rounded-md" /> },
);

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function StatsPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? FALLBACK_USER_ID;

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setDate(yearAgo.getDate() - 364);
  const fromDate = toIso(yearAgo);
  const toDate = toIso(today);

  const heatmap = useHeatmap(userId, fromDate, toDate);
  const achievements = useAchievements(userId);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Statistics</h1>

      {/* Full heatmap — 365 days */}
      <section aria-labelledby="heatmap-heading">
        <h2 id="heatmap-heading" className="mb-3 text-lg font-medium">
          Activity
        </h2>
        {heatmap.isPending ? (
          <Skeleton className="h-36 w-full rounded-md" />
        ) : heatmap.isError ? (
          <p className="text-sm text-destructive">Failed to load activity data.</p>
        ) : (
          <Heatmap data={heatmap.data} toDate={toDate} />
        )}
      </section>

      {/* Retention — placeholder (real calc per §5.6 deferred) */}
      <section aria-labelledby="retention-heading">
        <h2 id="retention-heading" className="mb-3 text-lg font-medium">
          Retention
        </h2>
        <p className="text-sm text-muted-foreground">
          Retention rate calculation coming soon (doc §5.6).
        </p>
      </section>

      {/* Full achievements grid — all 10 badges */}
      <section aria-labelledby="achievements-heading">
        <h2 id="achievements-heading" className="mb-3 text-lg font-medium">
          Achievements
        </h2>
        {achievements.isPending ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : achievements.isError ? (
          <p className="text-sm text-destructive">Failed to load achievements.</p>
        ) : (
          <AchievementsGrid earned={achievements.data.earned} locked={achievements.data.locked} />
        )}
      </section>
    </div>
  );
}

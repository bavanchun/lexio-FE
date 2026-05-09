'use client';

/**
 * AchievementsGrid — renders earned (unlocked) and locked badge tiles.
 * 4 cols on lg, 2 on md, 1 on sm.
 * Locked tiles: opacity-50, "Locked" caption + trigger text.
 * Earned tiles: full opacity, earned date shown.
 */
import { Trophy } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
// eslint-disable-next-line boundaries/dependencies
import type { EarnedBadge, AchievementBadge } from '../services/stats-queries';

// ---------------------------------------------------------------------------
// Single tile
// ---------------------------------------------------------------------------

interface AchievementTileProps {
  badge: AchievementBadge | EarnedBadge;
  earned: boolean;
}

function isEarnedBadge(b: AchievementBadge | EarnedBadge): b is EarnedBadge {
  return 'earnedAt' in b;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function AchievementTile({ badge, earned }: AchievementTileProps) {
  return (
    <Card className={`border shadow-none${earned ? '' : ' opacity-50'}`}>
      <CardContent className="flex flex-col gap-2 p-4">
        <Trophy
          className={`h-6 w-6 ${earned ? 'text-primary' : 'text-muted-foreground'}`}
          strokeWidth={1.5}
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{badge.name}</span>
          <span className="text-xs text-muted-foreground">{badge.trigger}</span>
        </div>
        {earned && isEarnedBadge(badge) ? (
          <span className="text-xs text-muted-foreground">
            Earned on {formatDate(badge.earnedAt)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Locked</span>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Grid
// ---------------------------------------------------------------------------

interface AchievementsGridProps {
  earned: EarnedBadge[];
  locked: AchievementBadge[];
  /** If provided, only show this many badges total (with earned first). */
  limit?: number;
}

export function AchievementsGrid({ earned, locked, limit }: AchievementsGridProps) {
  const allEarned = earned.map((b) => ({ badge: b, isEarned: true }));
  const allLocked = locked.map((b) => ({ badge: b, isEarned: false }));
  const combined = [...allEarned, ...allLocked];
  const visible = limit != null ? combined.slice(0, limit) : combined;

  if (visible.length === 0) {
    return <p className="text-sm text-muted-foreground">No achievements yet — keep studying!</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {visible.map(({ badge, isEarned }) => (
        <AchievementTile key={badge.code} badge={badge} earned={isEarned} />
      ))}
    </div>
  );
}

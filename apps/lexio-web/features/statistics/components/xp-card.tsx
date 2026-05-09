'use client';

/**
 * XpCard — displays current level and XP progress bar to next level.
 * Custom progress bar (bg-muted / bg-primary fill) per spec — avoids extra ShadCN import.
 * Lucide Zap icon.
 */
import { Zap } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

interface XpCardProps {
  level: number;
  totalXp: number;
  xpToNext: number;
}

export function XpCard({ level, totalXp, xpToNext }: XpCardProps) {
  const pct =
    xpToNext > 0 ? Math.min(100, Math.round((totalXp / (totalXp + xpToNext)) * 100)) : 100;

  return (
    <Card className="border shadow-none">
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-sm text-muted-foreground">Level</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-medium tabular-nums">{level}</span>
        </div>
        {/* Custom progress bar — h-2 rounded-full, bg-muted track, bg-primary fill */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`XP progress: ${pct}%`}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {xpToNext} xp to level {level + 1}
        </p>
      </CardContent>
    </Card>
  );
}

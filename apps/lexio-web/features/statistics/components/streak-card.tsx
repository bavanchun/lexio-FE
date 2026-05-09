'use client';

/**
 * StreakCard — displays current streak with Lucide Flame icon,
 * longest record caption. ShadCN Card, no shadow.
 * Flame is emerald (success semantic per §12.3.3) when streak > 0, muted when broken.
 */
import { Flame } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

interface StreakCardProps {
  current: number;
  longest: number;
}

export function StreakCard({ current, longest }: StreakCardProps) {
  const isActive = current > 0;

  return (
    <Card className="border shadow-none">
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Flame
            className={`h-6 w-6 ${isActive ? 'text-emerald-500' : 'text-muted-foreground'}`}
            strokeWidth={1.5}
          />
          <span className="text-sm text-muted-foreground">Day streak</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-medium tabular-nums">{current}</span>
          <span className="text-sm text-muted-foreground">days</span>
        </div>
        <p className="text-xs text-muted-foreground">Best: {longest} days</p>
      </CardContent>
    </Card>
  );
}

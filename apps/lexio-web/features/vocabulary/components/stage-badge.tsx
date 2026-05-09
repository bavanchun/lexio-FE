/**
 * StageBadge — displays the SRS learning stage with semantic color per §12.3.3.
 *   Mature  → success (green)
 *   Young   → info (blue)
 *   Learning → warning (amber)
 *   New     → muted (gray)
 */
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { Stage } from '@/core/entities/user-card';

interface StageBadgeProps {
  stage: Stage;
  className?: string;
}

const stageStyles: Record<Stage, string> = {
  Mature: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Young: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Learning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  New: 'bg-muted text-muted-foreground',
};

export function StageBadge({ stage, className }: StageBadgeProps) {
  return (
    <Badge variant="outline" className={cn('border-transparent', stageStyles[stage], className)}>
      {stage}
    </Badge>
  );
}

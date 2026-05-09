'use client';

/**
 * SessionProgress — top bar showing card index, progress bar, XP pill, close button.
 * Purely presentational — all state flows in as props.
 */
import { XIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface SessionProgressProps {
  current: number; // 1-based index of current card
  total: number;
  xpEarned: number;
  onExit: () => void;
}

export function SessionProgress({ current, total, xpEarned, onExit }: SessionProgressProps) {
  const pct = total > 0 ? Math.min(100, Math.round(((current - 1) / total) * 100)) : 0;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        {/* Card counter */}
        <span className="text-sm text-muted-foreground tabular-nums">
          {current} / {total}
        </span>

        {/* XP pill */}
        {xpEarned > 0 && (
          <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
            +{xpEarned} XP
          </span>
        )}

        {/* Exit button */}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto -mr-2 h-8 w-8 p-0"
          onClick={onExit}
          aria-label="Exit session"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% complete`}
        />
      </div>
    </div>
  );
}

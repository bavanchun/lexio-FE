'use client';

/**
 * HeatmapDayModal — ShadCN Dialog shown when user clicks a heatmap cell.
 * Displays ISO date heading, cards reviewed, accuracy if available, time spent if available.
 * All text sentence case. Link to view session (deferred — shows placeholder).
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';

interface HeatmapDayModalProps {
  open: boolean;
  onClose: () => void;
  date: string; // ISO date YYYY-MM-DD
  count: number;
  accuracy?: number | null; // 0-100 or null if unavailable
  minutesSpent?: number | null;
}

function formatDate(iso: string): string {
  // e.g. "2025-05-09" → "May 9, 2025"
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year!, month! - 1, day!).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function HeatmapDayModal({
  open,
  onClose,
  date,
  count,
  accuracy,
  minutesSpent,
}: HeatmapDayModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            {date ? formatDate(date) : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cards reviewed</span>
            <span className="font-medium tabular-nums">{count}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Accuracy</span>
            <span className="font-medium tabular-nums">
              {accuracy != null ? `${Math.round(accuracy)}%` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Time spent</span>
            <span className="font-medium tabular-nums">
              {minutesSpent != null ? `${minutesSpent} min` : '—'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

/**
 * Heatmap — pure SVG GitHub-style 365-day activity grid.
 * No Recharts. 7 rows × ~53 columns, 11×11px cells with 2px gap.
 * Colors from heatmap-color-scale.ts (Zinc→Indigo per §12.5 rule 8).
 * Lazy-loaded via next/dynamic from parent (ssr:false).
 * Click any cell → HeatmapDayModal with details.
 */
import { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
// eslint-disable-next-line boundaries/dependencies
import { heatmapColor, heatmapIntensity } from '../lib/heatmap-color-scale';
// eslint-disable-next-line boundaries/dependencies
import { HeatmapDayModal } from './heatmap-day-modal';
// eslint-disable-next-line boundaries/dependencies
import type { HeatmapData } from '../services/stats-queries';

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const CELL_SIZE = 11;
const GAP = 2;
const STEP = CELL_SIZE + GAP;
const WEEKS = 53;
const DAYS = 7;
const LABEL_LEFT = 28; // px reserved for day-of-week labels
const LABEL_TOP = 18; // px reserved for month labels

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''] as const;
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

// ---------------------------------------------------------------------------
// Date utilities
// ---------------------------------------------------------------------------

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Build ordered list of ISO dates for the 365-day window ending at toDate (inclusive). */
function buildDateGrid(toDate: Date): string[] {
  const dates: string[] = [];
  const start = new Date(toDate);
  start.setDate(start.getDate() - 364);
  // Align to Monday of start week
  const dayOfWeek = (start.getDay() + 6) % 7; // Mon=0 … Sun=6
  start.setDate(start.getDate() - dayOfWeek);

  const d = new Date(start);
  for (let w = 0; w < WEEKS; w++) {
    for (let day = 0; day < DAYS; day++) {
      dates.push(toIso(d));
      d.setDate(d.getDate() + 1);
    }
  }
  return dates;
}

/** Compute month label x positions from the date grid (week columns). */
function buildMonthLabels(dates: string[]): Array<{ label: string; x: number }> {
  const seen = new Set<string>();
  const labels: Array<{ label: string; x: number }> = [];
  for (let w = 0; w < WEEKS; w++) {
    const iso = dates[w * DAYS];
    if (!iso) continue;
    const month = iso.slice(0, 7); // YYYY-MM
    if (!seen.has(month)) {
      seen.add(month);
      const monthIndex = parseInt(iso.slice(5, 7), 10) - 1;
      labels.push({ label: MONTH_NAMES[monthIndex]!, x: LABEL_LEFT + w * STEP });
    }
  }
  return labels;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface HeatmapProps {
  data: HeatmapData;
  /** ISO date YYYY-MM-DD — last day of the grid window (defaults to today). */
  toDate?: string;
}

interface SelectedCell {
  date: string;
  count: number;
}

const SVG_WIDTH = LABEL_LEFT + WEEKS * STEP;
const SVG_HEIGHT = LABEL_TOP + DAYS * STEP;

export function Heatmap({ data, toDate }: HeatmapProps) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === 'dark' ? 'dark' : 'light';

  const endDate = toDate ? new Date(toDate) : new Date();
  const dates = buildDateGrid(endDate);
  const monthLabels = buildMonthLabels(dates);

  const [selected, setSelected] = useState<SelectedCell | null>(null);

  const handleCellClick = useCallback((date: string, count: number) => {
    setSelected({ date, count });
  }, []);

  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <>
      <div className="overflow-x-auto">
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} aria-label="Activity heatmap" role="img">
          {/* Month labels */}
          {monthLabels.map(({ label, x }) => (
            <text
              key={label + x}
              x={x}
              y={LABEL_TOP - 4}
              className="fill-muted-foreground"
              style={{ fontSize: 10, fontFamily: 'inherit' }}
            >
              {label}
            </text>
          ))}

          {/* Day-of-week labels (Mon, Wed, Fri) */}
          {DAY_LABELS.map((label, i) =>
            label ? (
              <text
                key={i}
                x={LABEL_LEFT - 4}
                y={LABEL_TOP + i * STEP + CELL_SIZE - 2}
                textAnchor="end"
                className="fill-muted-foreground"
                style={{ fontSize: 9, fontFamily: 'inherit' }}
              >
                {label}
              </text>
            ) : null,
          )}

          {/* Grid cells */}
          {dates.map((iso, idx) => {
            const week = Math.floor(idx / DAYS);
            const dayOfWeek = idx % DAYS;
            const count = data[iso] ?? 0;
            const cx = LABEL_LEFT + week * STEP;
            const cy = LABEL_TOP + dayOfWeek * STEP;
            const color = heatmapColor(count, mode);
            const intensity = heatmapIntensity(count);

            return (
              <rect
                key={iso}
                x={cx}
                y={cy}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                ry={2}
                style={{
                  backgroundColor: undefined,
                  fill: color,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                data-date={iso}
                data-intensity={intensity}
                aria-label={`${iso}: ${count} reviews`}
                onClick={() => handleCellClick(iso, count)}
              >
                <title>{`${iso}: ${count} review${count !== 1 ? 's' : ''}`}</title>
              </rect>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          {([0, 1, 2, 3, 4] as const).map((bucket) => (
            <div
              key={bucket}
              className="h-2.5 w-2.5 rounded-sm"
              style={{
                backgroundColor: heatmapColor(
                  bucket === 0 ? 0 : bucket === 1 ? 5 : bucket === 2 ? 20 : bucket === 3 ? 50 : 200,
                  mode,
                ),
              }}
              aria-hidden="true"
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {selected && (
        <HeatmapDayModal
          open={true}
          onClose={handleClose}
          date={selected.date}
          count={selected.count}
          accuracy={null}
          minutesSpent={null}
        />
      )}
    </>
  );
}

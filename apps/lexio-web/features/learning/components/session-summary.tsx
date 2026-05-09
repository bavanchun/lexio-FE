'use client';

/**
 * SessionSummary — end-of-session results card.
 * Shows: cards reviewed, accuracy %, time spent, XP earned,
 * streak status, achievements unlocked, and navigation CTAs.
 */
import { FlameIcon, TrophyIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
// eslint-disable-next-line boundaries/dependencies
import type { SessionSummary as SessionSummaryData } from '../types';

interface SessionSummaryProps {
  summary: SessionSummaryData;
  onBackToDashboard: () => void;
  onStudyMore: () => void;
}

/** Converts a duration in ms to a mm:ss string. */
function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/** Maps a badge code to a human-readable label (sentence case). */
function badgeLabel(code: string): string {
  const labels: Record<string, string> = {
    first_steps: 'First steps',
    week_warrior: 'Week warrior',
    month_master: 'Month master',
    century_club: 'Century club',
    kilo_crusher: 'Kilo crusher',
    speed_demon: 'Speed demon',
    perfect_day: 'Perfect day',
    comeback_kid: 'Comeback kid',
    polyglot_path: 'Polyglot path',
  };
  return labels[code] ?? code.replace(/_/g, ' ');
}

export function SessionSummary({ summary, onBackToDashboard, onStudyMore }: SessionSummaryProps) {
  const accuracy =
    summary.cardsReviewed > 0
      ? Math.round((summary.correctCount / summary.cardsReviewed) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Session complete</h1>
        <p className="mt-1 text-sm text-muted-foreground">Great work — keep the streak going!</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Cards reviewed" value={String(summary.cardsReviewed)} />
        <StatCard label="Accuracy" value={`${accuracy}%`} />
        <StatCard label="Time spent" value={formatDuration(summary.totalDurationMs)} />
        <StatCard label="XP earned" value={`+${summary.xpEarned}`} highlight />
      </div>

      {/* Streak status */}
      <div className="flex items-center justify-center gap-2 rounded-lg border bg-card p-3">
        <FlameIcon className="h-5 w-5 text-orange-500" />
        <span className="text-sm font-medium">{summary.streakCurrent} day streak</span>
      </div>

      {/* Achievements unlocked */}
      {summary.achievementsEarned.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Achievements unlocked</p>
          <div className="flex flex-wrap gap-2">
            {summary.achievementsEarned.map((code) => (
              <div
                key={code}
                className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1"
              >
                <TrophyIcon className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium">{badgeLabel(code)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" className="flex-1" onClick={onBackToDashboard}>
          Back to dashboard
        </Button>
        <Button className="flex-1" onClick={onStudyMore}>
          Study more
        </Button>
      </div>
    </div>
  );
}

// ── Sub-component ────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border bg-card p-3 text-center">
      <span className={`text-2xl font-semibold tabular-nums ${highlight ? 'text-indigo-400' : ''}`}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

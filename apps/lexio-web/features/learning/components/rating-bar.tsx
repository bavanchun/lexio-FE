'use client';

/**
 * RatingBar — 4-button SM-2 rating row rendered after card is flipped.
 * Shows: rating label + projected next-interval preview (dry-run).
 * Color semantics use a small dot (not button variant) per design rule 4
 * (max 2 accent colors). Keyboard hints 1–4 shown in muted text.
 */
import { useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { calculateNextReview } from '@/core/use-cases/srs/calculate-next-review';
import type { UserCard } from '@/core/entities/user-card';
import type { Rating } from '@/core/entities/review';

interface RatingBarProps {
  userCard: UserCard;
  onRate: (rating: Rating) => void;
  /** Disabled while a submission is in flight — prevents double-submit. */
  disabled?: boolean;
}

interface RatingConfig {
  rating: Rating;
  label: string;
  dotClass: string; // Tailwind color class for the dot indicator
  key: string;
}

const RATINGS: RatingConfig[] = [
  { rating: 1, label: 'Again', dotClass: 'bg-red-500', key: '1' },
  { rating: 2, label: 'Hard', dotClass: 'bg-amber-500', key: '2' },
  { rating: 3, label: 'Good', dotClass: 'bg-indigo-500', key: '3' },
  { rating: 4, label: 'Easy', dotClass: 'bg-emerald-500', key: '4' },
];

/** Formats a projected interval into a short human-readable label. */
function formatInterval(intervalDays: number, intervalMinutes?: number): string {
  if (intervalDays === 0 && intervalMinutes !== undefined) {
    return intervalMinutes >= 60 ? `${Math.round(intervalMinutes / 60)}h` : `${intervalMinutes}m`;
  }
  if (intervalDays === 1) return '1 d';
  if (intervalDays < 30) return `${intervalDays} d`;
  const weeks = Math.round(intervalDays / 7);
  return `${weeks}w`;
}

export function RatingBar({ userCard, onRate, disabled = false }: RatingBarProps) {
  const now = new Date();

  const getPreview = useCallback(
    (rating: Rating): string => {
      try {
        const { userCard: next } = calculateNextReview({ userCard, rating, now });
        return formatInterval(next.intervalDays, next.intervalMinutes);
      } catch {
        return '—';
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userCard],
  );

  return (
    <div className="flex w-full gap-2" role="group" aria-label="Rate this card">
      {RATINGS.map(({ rating, label, dotClass, key }) => {
        const preview = getPreview(rating);
        return (
          <Button
            key={rating}
            variant="outline"
            className="flex flex-1 flex-col items-center gap-0.5 py-3 h-auto"
            onClick={() => onRate(rating)}
            disabled={disabled}
            aria-label={`${label} — next review in ${preview}`}
          >
            {/* Color dot — the sole accent indicator per design rule 4 */}
            <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">{preview}</span>
            {/* Keyboard hint */}
            <span className="text-[10px] text-muted-foreground/60">{key}</span>
          </Button>
        );
      })}
    </div>
  );
}

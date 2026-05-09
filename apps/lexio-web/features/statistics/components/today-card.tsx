'use client';

/**
 * TodayCard — shows due count, new count, estimated minutes, and a CTA to start studying.
 * All icons are muted (not accent) per §12.5 rule 5 (accent ≤10% pixel area).
 */
import Link from 'next/link';
import { Clock, Sparkles, Timer } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

interface TodayCardProps {
  dueCount: number;
  newCount: number;
  estimatedMinutes: number;
  /** Deck ID to start studying. Required to build correct /study/new?deckId= URL. */
  deckId?: string;
}

export function TodayCard({ dueCount, newCount, estimatedMinutes, deckId }: TodayCardProps) {
  const hasWork = dueCount > 0 || newCount > 0;
  const studyHref = deckId ? `/study/new?deckId=${deckId}` : '/decks';

  return (
    <Card className="border shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <span className="text-sm font-medium">Today</span>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" strokeWidth={1.5} />
              <span>Due for review</span>
            </div>
            <span className="text-sm font-medium tabular-nums" data-testid="today-due-count">
              {dueCount}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              <span>New cards</span>
            </div>
            <span className="text-sm font-medium tabular-nums">{newCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" strokeWidth={1.5} />
              <span>Estimated time</span>
            </div>
            <span className="text-sm font-medium tabular-nums">
              {estimatedMinutes > 0 ? `${estimatedMinutes} min` : '—'}
            </span>
          </div>
        </div>

        {hasWork && (
          <Button asChild size="sm" className="mt-1 w-full" data-testid="start-studying-btn">
            <Link href={studyHref}>Start studying</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

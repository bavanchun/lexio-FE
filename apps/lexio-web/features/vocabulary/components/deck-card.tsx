'use client';

/**
 * DeckCard — card UI for a single deck in the deck list grid.
 * Shows: title, description, card count badge, visibility chip, updated time.
 * Click → navigate to /decks/[id].
 * Border only, no shadow per §12.5 rule 2.
 */
import { useRouter } from 'next/navigation';
import { LockIcon, GlobeIcon, LayersIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import type { Deck } from '@/core/entities/deck';

interface DeckCardProps {
  deck: Deck;
  cardCount?: number;
}

function formatUpdated(isoOrMs: string | number): string {
  const date = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function DeckCard({ deck, cardCount }: DeckCardProps) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/40"
      onClick={() => router.push(`/decks/${deck.id}`)}
      role="link"
      aria-label={`Open deck: ${deck.title}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-medium">{deck.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0 gap-1">
            {deck.visibility === 'public' ? (
              <GlobeIcon className="h-3 w-3" />
            ) : (
              <LockIcon className="h-3 w-3" />
            )}
            {deck.visibility}
          </Badge>
        </div>
        {deck.description && (
          <CardDescription className="line-clamp-2">{deck.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LayersIcon className="h-4 w-4" />
          {cardCount !== undefined ? (
            <span>
              {cardCount} {cardCount === 1 ? 'card' : 'cards'}
            </span>
          ) : (
            <span>Cards</span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <span className="text-xs text-muted-foreground">
          Updated {formatUpdated(deck.updatedAt)}
        </span>
      </CardFooter>
    </Card>
  );
}

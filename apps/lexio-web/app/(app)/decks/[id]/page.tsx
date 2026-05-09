'use client';

/**
 * /decks/[id] — deck detail page.
 * Shows deck header (title, description, card count, "Start studying" CTA)
 * and a CardsTable. Click card row → preview drawer.
 */
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertCircleIcon, ArrowLeftIcon, BookOpenIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Badge } from '@/shared/components/ui/badge';
import { useDeck } from '@/features/vocabulary/services/use-deck';
import { useDeckCards } from '@/features/vocabulary/services/use-deck-cards';
import { CardsTable } from '@/features/vocabulary/components/cards-table';

interface DeckDetailPageProps {
  params: Promise<{ id: string }>;
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      <AlertCircleIcon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function DeckHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export default function DeckDetailPage({ params }: DeckDetailPageProps) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();

  const { data: deck, isLoading: deckLoading, isError: deckError } = useDeck(id);
  const { data: cards, isLoading: cardsLoading, isError: cardsError } = useDeckCards(id);

  const isError = deckError || cardsError;

  return (
    <div className="flex flex-col gap-6">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit gap-1.5"
        onClick={() => router.push('/decks')}
        aria-label="Back to decks"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('decks.title')}
      </Button>

      {/* Deck header */}
      {deckLoading && <DeckHeaderSkeleton />}
      {isError && <ErrorState message={t('common.error')} />}
      {deck && !deckError && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{deck.title}</h1>
              <Badge variant="secondary">{deck.visibility}</Badge>
            </div>
            {deck.description && (
              <p className="text-sm text-muted-foreground">{deck.description}</p>
            )}
            {cards && (
              <p className="text-xs text-muted-foreground">
                {cards.length} {cards.length === 1 ? 'card' : 'cards'}
              </p>
            )}
          </div>

          {/* Start studying CTA — navigates to study session creation */}
          <Button
            className="shrink-0 gap-1.5"
            onClick={() => router.push(`/study/new?deckId=${id}`)}
            aria-label={t('decks.startStudying')}
          >
            <BookOpenIcon className="h-4 w-4" />
            {t('decks.startStudying')}
          </Button>
        </div>
      )}

      {/* Cards table */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t('decks.cardsTab')}</h2>
        <CardsTable cards={cards ?? []} isLoading={cardsLoading} />
      </div>
    </div>
  );
}

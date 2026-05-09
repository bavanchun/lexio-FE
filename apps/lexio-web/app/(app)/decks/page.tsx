'use client';

/**
 * /decks — deck list page.
 * Shows all decks owned by the current user via useDecks hook.
 * Loading: skeleton grid. Empty: helpful seed hint. Error: alert.
 */
import { useTranslations } from 'next-intl';
import { AlertCircleIcon, LayersIcon } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAuthStore } from '@/features/auth';
import { useDecks } from '@/features/vocabulary/services/use-decks';
import { DeckGrid } from '@/features/vocabulary/components/deck-grid';

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl p-4 ring-1 ring-foreground/10">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <LayersIcon className="h-6 w-6" />
      <p className="max-w-sm text-center text-sm">{message}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      <AlertCircleIcon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default function DecksPage() {
  const t = useTranslations();
  const userId = useAuthStore((s) => s.user?.id ?? '');
  const { data: decks, isLoading, isError } = useDecks(userId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('decks.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('decks.subtitle')}</p>
      </div>

      {isLoading && <LoadingSkeleton />}
      {isError && <ErrorState message={t('common.error')} />}
      {!isLoading && !isError && decks?.length === 0 && <EmptyState message={t('decks.empty')} />}
      {!isLoading && !isError && decks && decks.length > 0 && <DeckGrid decks={decks} />}
    </div>
  );
}

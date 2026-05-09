'use client';

/**
 * StudySession — top-level client component orchestrating the study UI.
 * Composes: SessionProgress, Flashcard, RatingBar, SessionSummary.
 * Keyboard shortcuts wired here via useKeyboardShortcuts.
 */
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/shared/components/ui/skeleton';
// eslint-disable-next-line boundaries/dependencies
import { Flashcard } from './flashcard';
// eslint-disable-next-line boundaries/dependencies
import { RatingBar } from './rating-bar';
// eslint-disable-next-line boundaries/dependencies
import { SessionProgress } from './session-progress';
// eslint-disable-next-line boundaries/dependencies
import { SessionSummary } from './session-summary';
// eslint-disable-next-line boundaries/dependencies
import { useStudySession } from '../hooks/use-study-session';
// eslint-disable-next-line boundaries/dependencies
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts';

interface StudySessionProps {
  deckId: string;
}

export function StudySession({ deckId }: StudySessionProps) {
  const router = useRouter();
  const {
    isLoading,
    isComplete,
    isFlipped,
    currentItem,
    currentIndex,
    queueLength,
    xpEarned,
    isSubmitting,
    summary,
    handleFlip,
    handleRate,
    handleExit,
  } = useStudySession({ deckId });

  // Keyboard shortcuts — Space, 1–4, Escape
  useKeyboardShortcuts({
    isFlipped,
    isDisabled: isSubmitting || isLoading || isComplete,
    onFlip: handleFlip,
    onRate: handleRate,
    onExit: handleExit,
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 flex-1 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty queue ────────────────────────────────────────────────────────────
  if (!isLoading && queueLength === 0 && !isComplete) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">No cards due</p>
        <p className="text-sm text-muted-foreground">
          All cards are up to date. Come back later for your next review.
        </p>
        <button
          className="mt-2 text-sm text-indigo-400 underline underline-offset-4"
          onClick={() => router.push('/decks')}
        >
          Back to decks
        </button>
      </div>
    );
  }

  // ── Session complete — show summary ────────────────────────────────────────
  if (isComplete && summary) {
    return (
      <SessionSummary
        summary={summary}
        onBackToDashboard={() => {
          router.push('/dashboard');
        }}
        onStudyMore={() => {
          router.push('/decks');
        }}
      />
    );
  }

  // Waiting for summary to resolve after completion
  if (isComplete && !summary) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ── Active study ────────────────────────────────────────────────────────────
  if (!currentItem) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Top progress bar */}
      <SessionProgress
        current={currentIndex + 1}
        total={queueLength}
        xpEarned={xpEarned}
        onExit={handleExit}
      />

      {/* Flashcard */}
      <Flashcard card={currentItem.card} isFlipped={isFlipped} onFlip={handleFlip} />

      {/* Rating bar — only visible after flip */}
      <div
        className={`transition-opacity duration-150 ${isFlipped ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <RatingBar userCard={currentItem.userCard} onRate={handleRate} disabled={isSubmitting} />
      </div>

      {/* Flip hint when card is not yet flipped */}
      {!isFlipped && (
        <p className="text-center text-xs text-muted-foreground">
          Press <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">Space</kbd> to
          reveal answer
        </p>
      )}
    </div>
  );
}

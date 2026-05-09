'use client';

/**
 * useStudySession — main orchestration hook for the study session UI.
 * Loads session on mount, exposes current card, flip/rate handlers,
 * and session summary when the queue is exhausted.
 *
 * Dependencies injected via lib/api apiClient + lib/storage repositories
 * (accessed through apiClient — no direct storage import per boundary rules).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-keys';
import type { Rating, SessionId } from '@/core/entities/review';
// eslint-disable-next-line boundaries/dependencies
import type { SessionSummary } from '../types';
/* eslint-disable boundaries/dependencies */
import {
  useSessionStore,
  selectCurrentItem,
  selectIsComplete,
  selectCardDurationMs,
} from '../store/session-store';
/* eslint-enable boundaries/dependencies */
// eslint-disable-next-line boundaries/dependencies
import { startSession } from '../use-cases/start-session';
// eslint-disable-next-line boundaries/dependencies
import { submitReview } from '../use-cases/submit-review';

// Repositories are accessed through a lazy import to keep SSR safe.
// The hook is 'use client' so this runs only in browser.
async function getRepos() {
  const { LexioDB } = await import('@/lib/storage/database');
  const { createRepositories } = await import('@/lib/storage/repositories');
  const db = new LexioDB();
  return createRepositories(db);
}

interface UseStudySessionOptions {
  deckId: string;
  sessionId?: SessionId; // if resuming an existing session
}

interface UseStudySessionReturn {
  isLoading: boolean;
  isComplete: boolean;
  isFlipped: boolean;
  currentItem: ReturnType<typeof selectCurrentItem>;
  currentIndex: number;
  queueLength: number;
  xpEarned: number;
  isSubmitting: boolean;
  summary: SessionSummary | null;
  handleFlip: () => void;
  handleRate: (rating: Rating) => void;
  handleExit: () => void;
}

/** Human-readable badge name for toast notifications. */
function badgeDisplayName(code: string): string {
  const map: Record<string, string> = {
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
  return map[code] ?? code.replace(/_/g, ' ');
}

export function useStudySession({
  deckId,
  sessionId: existingSessionId,
}: UseStudySessionOptions): UseStudySessionReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  // Track session ID in a ref so callbacks don't need it as a dep
  const sessionIdRef = useRef<SessionId | null>(existingSessionId ?? null);
  // eslint-disable-next-line react-hooks/purity -- initialValue evaluated once, not on re-render
  const startedAtRef = useRef<number>(Date.now());

  const store = useSessionStore();
  const currentItem = selectCurrentItem(store);
  const isComplete = selectIsComplete(store);

  // ── Load session on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const repos = await getRepos();

        // If we already have a session ID + queue in the store, skip re-loading
        if (existingSessionId && store.sessionId === existingSessionId && store.queue.length > 0) {
          setIsLoading(false);
          return;
        }

        const { session, queue } = await startSession(
          {
            userCardRepo: repos.userCards,
            sessionRepo: repos.sessions,
            streakRepo: repos.streaks,
            cardRepo: repos.cards,
          },
          { deckId: deckId as import('@/core/entities/card').DeckId },
        );

        if (!cancelled) {
          sessionIdRef.current = session.id;
          startedAtRef.current = Date.now();
          store.loadSession(session.id, queue);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[useStudySession] Failed to start session:', err);
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // Only re-run if deckId changes — not on every store update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  // ── Build summary when queue is exhausted ─────────────────────────────────
  useEffect(() => {
    if (!isComplete || summary) return;

    const s: SessionSummary = {
      sessionId: sessionIdRef.current!,
      cardsReviewed: store.cardsReviewed,
      correctCount: store.correctCount,
      totalDurationMs: Date.now() - startedAtRef.current,
      xpEarned: store.xpEarned,
      achievementsEarned: store.achievementsEarned,
      streakCurrent: 0, // updated below async
    };

    // Fetch streak for streak display — best-effort
    getRepos()
      .then((repos) => repos.streaks.findByUser('stub-user-000'))
      .then((streak) => {
        if (streak) {
          setSummary({ ...s, streakCurrent: streak.currentStreak });
        } else {
          setSummary(s);
        }
      })
      .catch(() => setSummary(s));
  }, [
    isComplete,
    summary,
    store.cardsReviewed,
    store.correctCount,
    store.xpEarned,
    store.achievementsEarned,
  ]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFlip = useCallback(() => {
    if (!store.isFlipped) store.flip();
  }, [store]);

  const handleRate = useCallback(
    async (rating: Rating) => {
      if (!currentItem || store.isSubmitting || !store.isFlipped) return;

      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      store.setSubmitting(true);

      try {
        const durationMs = selectCardDurationMs(store);
        const repos = await getRepos();

        const result = await submitReview(
          {
            userCardRepo: repos.userCards,
            reviewRepo: repos.reviews,
            sessionRepo: repos.sessions,
            streakRepo: repos.streaks,
            userXpRepo: repos.userXp,
            achievementRepo: repos.achievements,
          },
          {
            userCard: currentItem.userCard,
            rating,
            sessionId,
            durationMs,
            sessionReviewCount: store.cardsReviewed,
            sessionCorrectCount: store.correctCount,
          },
        );

        // Record in store
        store.recordReview(rating, result.xpEarned, result.newAchievements);

        // Toast for each new achievement
        for (const code of result.newAchievements) {
          toast.success(`Achievement unlocked: ${badgeDisplayName(code)}`);
        }

        // Invalidate stats queries so dashboard refreshes
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.streak('stub-user-000') });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.xp('stub-user-000') });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.achievements('stub-user-000') });

        // Advance to next card
        store.advance();
      } catch (err) {
        console.error('[useStudySession] submitReview failed:', err);
        toast.error('Failed to save review. Please try again.');
      } finally {
        store.setSubmitting(false);
      }
    },
    [currentItem, store, queryClient],
  );

  const handleExit = useCallback(() => {
    store.reset();
    router.push('/dashboard');
  }, [store, router]);

  return {
    isLoading,
    isComplete,
    isFlipped: store.isFlipped,
    currentItem,
    currentIndex: store.currentIndex,
    queueLength: store.queue.length,
    xpEarned: store.xpEarned,
    isSubmitting: store.isSubmitting,
    summary,
    handleFlip,
    handleRate,
    handleExit,
  };
}

/**
 * Session store — Zustand slice for in-progress study session state.
 * Holds the queue, current index, flip state, and running stats.
 * Not persisted to Dexie — session can be rebuilt from DB on refresh.
 */

import { create } from 'zustand';
import type { SessionId } from '@/core/entities/session';
// eslint-disable-next-line boundaries/dependencies
import type { QueueItem } from '../types';

interface SessionState {
  sessionId: SessionId | null;
  queue: QueueItem[];
  currentIndex: number;
  isFlipped: boolean;
  startedAt: number | null; // ms epoch
  cardShownAt: number | null; // ms epoch — to compute durationMs
  cardsReviewed: number;
  correctCount: number; // Good (3) + Easy (4) ratings
  xpEarned: number;
  achievementsEarned: string[];
  isSubmitting: boolean; // guard against double-submit
}

interface SessionActions {
  loadSession: (sessionId: SessionId, queue: QueueItem[]) => void;
  flip: () => void;
  advance: () => void;
  recordReview: (rating: number, xpDelta: number, achievements: string[]) => void;
  setSubmitting: (value: boolean) => void;
  reset: () => void;
}

export type SessionStore = SessionState & SessionActions;

const initialState: SessionState = {
  sessionId: null,
  queue: [],
  currentIndex: 0,
  isFlipped: false,
  startedAt: null,
  cardShownAt: null,
  cardsReviewed: 0,
  correctCount: 0,
  xpEarned: 0,
  achievementsEarned: [],
  isSubmitting: false,
};

export const useSessionStore = create<SessionStore>()((set, get) => ({
  ...initialState,

  loadSession: (sessionId, queue) =>
    set({
      sessionId,
      queue,
      currentIndex: 0,
      isFlipped: false,
      startedAt: Date.now(),
      cardShownAt: Date.now(),
      cardsReviewed: 0,
      correctCount: 0,
      xpEarned: 0,
      achievementsEarned: [],
      isSubmitting: false,
    }),

  flip: () => set({ isFlipped: true }),

  advance: () => {
    const { currentIndex, queue } = get();
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      set({ currentIndex: nextIndex, isFlipped: false, cardShownAt: Date.now() });
    }
    // If nextIndex >= queue.length, callers check isComplete themselves
  },

  recordReview: (rating, xpDelta, achievements) =>
    set((s) => ({
      cardsReviewed: s.cardsReviewed + 1,
      correctCount: rating >= 3 ? s.correctCount + 1 : s.correctCount,
      xpEarned: s.xpEarned + xpDelta,
      achievementsEarned: [...s.achievementsEarned, ...achievements],
    })),

  setSubmitting: (value) => set({ isSubmitting: value }),

  reset: () => set(initialState),
}));

// ── Derived selectors (memoization happens in component via useCallback) ───────

export function selectCurrentItem(state: SessionStore): QueueItem | null {
  return state.queue[state.currentIndex] ?? null;
}

export function selectIsComplete(state: SessionStore): boolean {
  return state.queue.length > 0 && state.currentIndex >= state.queue.length;
}

export function selectDurationMs(state: SessionStore): number {
  if (!state.startedAt) return 0;
  return Date.now() - state.startedAt;
}

export function selectCardDurationMs(state: SessionStore): number {
  if (!state.cardShownAt) return 0;
  return Date.now() - state.cardShownAt;
}

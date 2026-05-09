/**
 * Shared test helpers for SRS unit tests.
 * Builds minimal UserCard fixtures without hitting any storage layer.
 */

import type { UserCard, Stage } from '@/core/entities/user-card';
import type { UserCardId } from '@/core/entities/user-card';
import type { CardId, DeckId } from '@/core/entities/card';

export interface UserCardOverrides {
  stage?: Stage;
  easeFactor?: number;
  intervalDays?: number;
  intervalMinutes?: number;
  repetitions?: number;
  lapses?: number;
  consecutiveGoods?: number;
  nextReviewAt?: string;
}

/** Returns a deterministic base Date for tests: 2024-01-15T12:00:00.000Z */
export const BASE_NOW = new Date('2024-01-15T12:00:00.000Z');

/** Builds a UserCard fixture with sensible SM-2 defaults. */
export function makeUserCard(overrides: UserCardOverrides = {}): UserCard {
  return {
    id: 'uc-test-001' as UserCardId,
    userId: 'user-001',
    cardId: 'card-001' as CardId,
    deckId: 'deck-001' as DeckId,
    stage: overrides.stage ?? 'New',
    easeFactor: overrides.easeFactor ?? 2.5,
    intervalDays: overrides.intervalDays ?? 0,
    intervalMinutes: overrides.intervalMinutes,
    repetitions: overrides.repetitions ?? 0,
    lapses: overrides.lapses ?? 0,
    consecutiveGoods: overrides.consecutiveGoods ?? 0,
    nextReviewAt: overrides.nextReviewAt ?? BASE_NOW.toISOString(),
    isFavorite: false,
    personalNote: null,
    createdAt: BASE_NOW.toISOString(),
    updatedAt: BASE_NOW.toISOString(),
  };
}

/** Adds `days` calendar days to a Date — useful for asserting nextReviewAt. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

/** Adds `minutes` to a Date. */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

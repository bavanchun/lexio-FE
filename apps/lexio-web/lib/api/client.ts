/**
 * LexioApiClient — interface contract for the API layer.
 *
 * Implemented by:
 *   - MockApiClient (lib/api/mock-client.ts) — delegates to Dexie repos.
 *   - HttpApiClient (future) — real .NET 10 REST calls via fetch + Zod.
 *
 * Rule: features/ and app/ import ONLY from this interface, never from
 * concrete implementations. Swapping backends is a single-file change in
 * lib/api/index.ts.
 */

import type { Card, CardId, DeckId } from '@/core/entities/card';
import type { Deck } from '@/core/entities/deck';
import type { UserCard, UserCardId } from '@/core/entities/user-card';
import type { Session, SessionId } from '@/core/entities/session';
import type { Review } from '@/core/entities/review';
import type { Streak } from '@/core/entities/streak';
import type { UserXp } from '@/core/entities/user-xp';
import type { Achievement } from '@/core/entities/achievement';
import type { Rating } from '@/core/entities/review';
import type { ExerciseType } from '@/core/entities/card';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthApi {
  /** Returns the currently active stub user ID (no real auth in prototype). */
  getCurrentUserId(): string;
}

// ---------------------------------------------------------------------------
// Decks
// ---------------------------------------------------------------------------

export interface DecksApi {
  listMyDecks(userId: string): Promise<Deck[]>;
  getDeck(id: DeckId): Promise<Deck | null>;
  createDeck(payload: Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'cloneCount'>): Promise<Deck>;
  updateDeck(id: DeckId, patch: Partial<Omit<Deck, 'id'>>): Promise<Deck>;
  deleteDeck(id: DeckId): Promise<void>;
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export interface CardsApi {
  listByDeck(deckId: DeckId): Promise<Card[]>;
  getCard(id: CardId): Promise<Card | null>;
  searchCards(
    term: string,
    options?: { cefrLevel?: Card['cefrLevel']; tags?: string[]; limit?: number },
  ): Promise<Card[]>;
}

// ---------------------------------------------------------------------------
// User cards (SRS state)
// ---------------------------------------------------------------------------

export interface UserCardsApi {
  getDueQueue(userId: string, now: string, limit?: number): Promise<UserCard[]>;
  getNewQueue(userId: string, limit?: number): Promise<UserCard[]>;
  upsertUserCard(userCard: UserCard): Promise<UserCard>;
  updateUserCard(id: UserCardId, patch: Partial<Omit<UserCard, 'id'>>): Promise<UserCard>;
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export interface SessionsApi {
  startSession(userId: string, deckId: DeckId | null): Promise<Session>;
  endSession(id: SessionId, stats: { cardsReviewed: number; newCards: number }): Promise<Session>;
  getSession(id: SessionId): Promise<Session | null>;
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface ReviewPayload {
  userCardId: UserCardId;
  sessionId: SessionId;
  rating: Rating;
  durationMs: number;
  exerciseType: ExerciseType;
}

export interface ReviewsApi {
  submitReview(payload: ReviewPayload): Promise<Review>;
  listBySession(sessionId: SessionId): Promise<Review[]>;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export interface StatsApi {
  getStreak(userId: string): Promise<Streak | null>;
  getXp(userId: string): Promise<UserXp | null>;
  getAchievements(userId: string): Promise<Achievement[]>;
}

// ---------------------------------------------------------------------------
// Composite client
// ---------------------------------------------------------------------------

export interface LexioApiClient {
  auth: AuthApi;
  decks: DecksApi;
  cards: CardsApi;
  userCards: UserCardsApi;
  sessions: SessionsApi;
  reviews: ReviewsApi;
  stats: StatsApi;
}

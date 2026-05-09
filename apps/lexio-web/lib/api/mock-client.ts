/**
 * MockApiClient — implements LexioApiClient by delegating to Dexie repositories.
 * Adds simulated network latency (50-150ms, configurable) to mimic real HTTP.
 *
 * Replace with HttpApiClient in next iteration when .NET 10 services are scaffolded.
 */

import type { LexioApiClient, ReviewPayload } from './client';
import type { Repositories } from '@/lib/storage/repositories';
import type { CardId, DeckId } from '@/core/entities/card';
import type { DeckId as DeckEntityId } from '@/core/entities/deck';
import type { UserCardId } from '@/core/entities/user-card';
import type { SessionId } from '@/core/entities/session';
import { STUB_USER_ID } from '@/lib/storage/seed-loader';

// ---------------------------------------------------------------------------
// Latency simulation
// ---------------------------------------------------------------------------

interface MockClientOptions {
  /** Minimum simulated latency in ms. Default: 50 */
  minLatencyMs?: number;
  /** Maximum simulated latency in ms. Default: 150 */
  maxLatencyMs?: number;
}

function randomLatency(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class MockApiClient implements LexioApiClient {
  private readonly minMs: number;
  private readonly maxMs: number;
  private readonly repos: Repositories;

  constructor(repos: Repositories, options: MockClientOptions = {}) {
    this.repos = repos;
    this.minMs = options.minLatencyMs ?? 50;
    this.maxMs = options.maxLatencyMs ?? 150;
  }

  private async delay(): Promise<void> {
    await randomLatency(this.minMs, this.maxMs);
  }

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  readonly auth = {
    getCurrentUserId: (): string => STUB_USER_ID,
  };

  // -------------------------------------------------------------------------
  // Decks
  // -------------------------------------------------------------------------

  readonly decks = {
    listMyDecks: async (userId: string) => {
      await this.delay();
      return this.repos.decks.listByOwner(userId);
    },
    getDeck: async (id: DeckEntityId) => {
      await this.delay();
      return this.repos.decks.findById(id);
    },
    createDeck: async (payload: Parameters<LexioApiClient['decks']['createDeck']>[0]) => {
      await this.delay();
      return this.repos.decks.create(payload);
    },
    updateDeck: async (
      id: DeckEntityId,
      patch: Parameters<LexioApiClient['decks']['updateDeck']>[1],
    ) => {
      await this.delay();
      return this.repos.decks.update(id, patch);
    },
    deleteDeck: async (id: DeckEntityId) => {
      await this.delay();
      return this.repos.decks.delete(id);
    },
  };

  // -------------------------------------------------------------------------
  // Cards
  // -------------------------------------------------------------------------

  readonly cards = {
    listByDeck: async (deckId: DeckId) => {
      await this.delay();
      return this.repos.cards.listByDeck(deckId);
    },
    getCard: async (id: CardId) => {
      await this.delay();
      return this.repos.cards.findById(id);
    },
    searchCards: async (
      term: string,
      options?: Parameters<LexioApiClient['cards']['searchCards']>[1],
    ) => {
      await this.delay();
      return this.repos.cards.search({ term, ...options });
    },
  };

  // -------------------------------------------------------------------------
  // User cards
  // -------------------------------------------------------------------------

  readonly userCards = {
    getDueQueue: async (userId: string, now: string, limit = 50) => {
      await this.delay();
      return this.repos.userCards.listDue(userId, now, limit);
    },
    getNewQueue: async (userId: string, limit = 20) => {
      await this.delay();
      return this.repos.userCards.listNew(userId, limit);
    },
    upsertUserCard: async (
      userCard: Parameters<LexioApiClient['userCards']['upsertUserCard']>[0],
    ) => {
      await this.delay();
      return this.repos.userCards.upsert(userCard);
    },
    updateUserCard: async (
      id: UserCardId,
      patch: Parameters<LexioApiClient['userCards']['updateUserCard']>[1],
    ) => {
      await this.delay();
      return this.repos.userCards.update(id, patch);
    },
  };

  // -------------------------------------------------------------------------
  // Sessions
  // -------------------------------------------------------------------------

  readonly sessions = {
    startSession: async (userId: string, deckId: DeckId | null) => {
      await this.delay();
      return this.repos.sessions.create({
        userId,
        deckId,
        startedAt: new Date().toISOString(),
        endedAt: null,
        cardsReviewed: 0,
        newCards: 0,
      });
    },
    endSession: async (id: SessionId, stats: { cardsReviewed: number; newCards: number }) => {
      await this.delay();
      return this.repos.sessions.update(id, {
        endedAt: new Date().toISOString(),
        ...stats,
      });
    },
    getSession: async (id: SessionId) => {
      await this.delay();
      return this.repos.sessions.findById(id);
    },
  };

  // -------------------------------------------------------------------------
  // Reviews
  // -------------------------------------------------------------------------

  readonly reviews = {
    submitReview: async (payload: ReviewPayload) => {
      await this.delay();
      return this.repos.reviews.create({
        ...payload,
        reviewedAt: new Date().toISOString(),
      });
    },
    listBySession: async (sessionId: SessionId) => {
      await this.delay();
      return this.repos.reviews.listBySession(sessionId);
    },
  };

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  readonly stats = {
    getStreak: async (userId: string) => {
      await this.delay();
      return this.repos.streaks.findByUser(userId);
    },
    getXp: async (userId: string) => {
      await this.delay();
      return this.repos.userXp.findByUser(userId);
    },
    getAchievements: async (userId: string) => {
      await this.delay();
      return this.repos.achievements.listByUser(userId);
    },
  };
}

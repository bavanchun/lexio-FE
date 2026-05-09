/**
 * Dexie singleton — IndexedDB schema v1 mirroring doc §7.2.
 *
 * BROWSER-ONLY: Dexie requires IndexedDB, which is unavailable in Node/SSR.
 * This module exports `db` which is null during SSR. Always import inside
 * client components or call sites guarded with typeof window !== 'undefined'.
 *
 * Version bump strategy:
 *   Increment version number (1 → 2 → …) when schema changes.
 *   Add `.upgrade(tx => ...)` for data migrations.
 *   NEVER modify existing version's stores() call — it is a sealed snapshot.
 */

import Dexie, { type Table } from 'dexie';

// ---------------------------------------------------------------------------
// Row types — internal to lib/storage. Core entities map to/from these.
// Date fields stored as epoch ms (number) for index range scans.
// ---------------------------------------------------------------------------

export interface DeckRow {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  visibility: 'private' | 'public' | 'unlisted';
  cloneCount: number;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export interface CardRow {
  id: string;
  deckId: string;
  word: string;
  ipa: string | null;
  definition: string;
  exampleSentence: string | null;
  exampleTranslation: string | null;
  audioWordUrl: string | null;
  audioSentenceUrl: string | null;
  imageUrl: string | null;
  tags: string[];
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  exerciseTypes: string[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserCardRow {
  id: string;
  userId: string;
  cardId: string;
  deckId: string;
  stage: 'New' | 'Learning' | 'Young' | 'Mature';
  easeFactor: number;
  intervalDays: number;
  intervalMinutes?: number;
  repetitions: number;
  lapses: number;
  consecutiveGoods: number;
  nextReviewAt: number; // epoch ms — used for compound index range scan
  isFavorite: boolean;
  personalNote: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface SessionRow {
  id: string;
  userId: string;
  deckId: string | null;
  startedAt: number;
  endedAt: number | null;
  cardsReviewed: number;
  newCards: number;
}

export interface ReviewRow {
  id: string;
  userCardId: string;
  sessionId: string;
  rating: 1 | 2 | 3 | 4;
  durationMs: number;
  exerciseType: string;
  reviewedAt: number;
}

export interface StreakRow {
  userId: string; // primary key
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  heatmapData: Record<string, number>; // stored as JSON
}

export interface UserXpRow {
  userId: string; // primary key
  totalXp: number;
  level: number;
  xpToNext: number;
}

export interface AchievementRow {
  id: string;
  userId: string;
  badgeCode: string;
  earnedAt: number;
}

export interface DailyGoalRow {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  goalCount: number;
  achievedCount: number;
}

export interface MetadataRow {
  key: string; // primary key
  value: string | number | boolean;
}

// ---------------------------------------------------------------------------
// Dexie database class
// ---------------------------------------------------------------------------

export class LexioDB extends Dexie {
  decks!: Table<DeckRow, string>;
  cards!: Table<CardRow, string>;
  userCards!: Table<UserCardRow, string>;
  sessions!: Table<SessionRow, string>;
  reviews!: Table<ReviewRow, string>;
  streaks!: Table<StreakRow, string>;
  userXp!: Table<UserXpRow, string>;
  achievements!: Table<AchievementRow, string>;
  dailyGoals!: Table<DailyGoalRow, string>;
  metadata!: Table<MetadataRow, string>;

  constructor() {
    super('lexio-prototype-v1');

    /**
     * Version 1 — initial schema.
     * Index syntax: '&' = unique, '*' = multi-valued, '++' = auto-increment,
     * '[a+b]' = compound index.
     */
    this.version(1).stores({
      decks: 'id, ownerId, visibility, [ownerId+visibility], cloneCount',
      cards: 'id, word, deckId, cefrLevel, *tags',
      // [userId+nextReviewAt] is the perf-critical index replacing doc's BRIN
      userCards:
        'id, userId, cardId, deckId, stage, nextReviewAt, [userId+nextReviewAt], [userId+stage]',
      sessions: 'id, userId, startedAt',
      reviews: 'id, userCardId, sessionId, reviewedAt',
      streaks: '&userId, lastActiveDate',
      userXp: '&userId',
      achievements: 'id, userId, badgeCode, [userId+badgeCode], earnedAt',
      dailyGoals: 'id, [userId+date]',
      metadata: '&key',
    });
  }
}

// ---------------------------------------------------------------------------
// Browser-only singleton
// ---------------------------------------------------------------------------

/**
 * The Dexie singleton — null in SSR/Node environments.
 * Call sites in lib/storage/ assert non-null before use.
 * The DbInitGate client component ensures DB is open before rendering children.
 */
export const db: LexioDB | null = typeof window !== 'undefined' ? new LexioDB() : null;

/**
 * Returns the db instance, throwing in SSR.
 * Use inside repository methods to fail loudly on misuse.
 */
export function getDb(): LexioDB {
  if (!db) {
    throw new Error(
      '[LexioDB] IndexedDB is not available in this environment (SSR/Node). ' +
        'Import repositories only from client components.',
    );
  }
  return db;
}

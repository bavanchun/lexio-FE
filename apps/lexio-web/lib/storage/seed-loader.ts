/**
 * seedIfFresh — idempotent seed loader.
 *
 * On first browser run: fetches /data/seed-it-tech.json, creates the default
 * deck, inserts 30 cards + user_cards (all New, due immediately), seeds
 * streak and XP rows for the stub user, then sets metadata.isSeeded = true.
 *
 * On subsequent runs: detects metadata.isSeeded and returns early.
 *
 * Stub user ID is exported as STUB_USER_ID for use in UI components
 * before real auth is wired up.
 */

import type { LexioDB } from './database';
import type { DeckRow, CardRow, UserCardRow, StreakRow, UserXpRow } from './database';
import { RepositoryError } from './errors';

export const STUB_USER_ID = 'stub-user-000';
export const STUB_DECK_ID = 'seed-deck-it-tech-001';

// ---------------------------------------------------------------------------
// Seed file schema (minimal — full Zod validation in validate-seed.ts script)
// ---------------------------------------------------------------------------

interface SeedCard {
  word: string;
  /** Legacy single-IPA field — still accepted for backwards compat */
  ipa?: string | null;
  /** IPA — US variant (preferred) */
  ipaUs?: string | null;
  /** IPA — UK variant */
  ipaUk?: string | null;
  definition: string;
  exampleSentence: string | null;
  exampleTranslation: string | null;
  audioWordUrl: string | null;
  audioSentenceUrl: string | null;
  imageUrl: string | null;
  tags: string[];
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  exerciseTypes: string[];
  /** Common collocations (§4.2) */
  collocations?: string[];
  /** Synonyms in context (§4.2) */
  synonyms?: string[];
  /** Antonyms in context (§4.2) */
  antonyms?: string[];
  /** Related word forms (§4.2) */
  wordFamily?: { verb?: string; noun?: string; adj?: string; adv?: string } | null;
  /** Word origin (§4.2) */
  etymology?: string | null;
  /** Corpus frequency rank (§4.2) */
  frequencyRank?: number | null;
}

interface SeedFile {
  version: number;
  deck: { title: string; description: string };
  cards: SeedCard[];
}

export interface SeedResult {
  seeded: boolean;
  deckId?: string;
  cardCount: number;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function seedIfFresh(db: LexioDB): Promise<SeedResult> {
  // Check idempotency flag
  const metaRow = await db.metadata.get('isSeeded');
  if (metaRow?.value === true) {
    const count = await db.cards.count();
    return { seeded: false, cardCount: count };
  }

  // Fetch seed data from public static file
  let seedFile: SeedFile;
  try {
    const res = await fetch('/data/seed-it-tech.json');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching seed data`);
    }
    seedFile = (await res.json()) as SeedFile;
  } catch (err) {
    throw new RepositoryError('Failed to fetch seed data', err);
  }

  if (!Array.isArray(seedFile.cards) || seedFile.cards.length === 0) {
    throw new RepositoryError('Seed file contains no cards');
  }

  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  // Build rows
  const deckRow: DeckRow = {
    id: STUB_DECK_ID,
    ownerId: STUB_USER_ID,
    title: seedFile.deck.title,
    description: seedFile.deck.description,
    visibility: 'private',
    cloneCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const cardRows: CardRow[] = seedFile.cards.map((c, i) => ({
    id: `seed-card-${String(i + 1).padStart(3, '0')}`,
    deckId: STUB_DECK_ID,
    word: c.word,
    // Prefer split ipaUs/ipaUk; fall back to legacy ipa for old seed files
    ipa: c.ipa ?? null,
    ipaUs: c.ipaUs ?? c.ipa ?? null,
    ipaUk: c.ipaUk ?? null,
    definition: c.definition,
    exampleSentence: c.exampleSentence,
    exampleTranslation: c.exampleTranslation,
    audioWordUrl: c.audioWordUrl,
    audioSentenceUrl: c.audioSentenceUrl,
    imageUrl: c.imageUrl,
    tags: c.tags,
    cefrLevel: c.cefrLevel,
    exerciseTypes: c.exerciseTypes,
    collocations: c.collocations ?? [],
    synonyms: c.synonyms ?? [],
    antonyms: c.antonyms ?? [],
    wordFamily: c.wordFamily ?? null,
    etymology: c.etymology ?? null,
    frequencyRank: c.frequencyRank ?? null,
    createdBy: STUB_USER_ID,
    createdAt: now,
    updatedAt: now,
  }));

  const userCardRows: UserCardRow[] = cardRows.map((card, i) => ({
    id: `seed-uc-${String(i + 1).padStart(3, '0')}`,
    userId: STUB_USER_ID,
    cardId: card.id,
    deckId: STUB_DECK_ID,
    stage: 'New',
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    consecutiveGoods: 0,
    // nextReviewAt = now so all 30 cards are due immediately on first run
    nextReviewAt: now,
    isFavorite: false,
    personalNote: null,
    createdAt: now,
    updatedAt: now,
  }));

  const streakRow: StreakRow = {
    userId: STUB_USER_ID,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: nowIso.slice(0, 10),
    heatmapData: {},
  };

  const xpRow: UserXpRow = {
    userId: STUB_USER_ID,
    totalXp: 0,
    level: 1,
    xpToNext: 100,
  };

  // Single transaction — atomic; safe under React StrictMode double-invoke
  // because isSeeded check + put are in the same rw transaction.
  await db.transaction(
    'rw',
    [db.decks, db.cards, db.userCards, db.streaks, db.userXp, db.metadata],
    async () => {
      // Re-check inside transaction to handle concurrent double-mount
      const flag = await db.metadata.get('isSeeded');
      if (flag?.value === true) return;

      await db.decks.put(deckRow);
      await db.cards.bulkPut(cardRows);
      await db.userCards.bulkPut(userCardRows);
      await db.streaks.put(streakRow);
      await db.userXp.put(xpRow);
      await db.metadata.put({ key: 'isSeeded', value: true });
    },
  );

  return { seeded: true, deckId: STUB_DECK_ID, cardCount: cardRows.length };
}

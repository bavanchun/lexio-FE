/**
 * seedIfFresh tests — idempotency, card count, user_card initial state.
 * fetch is mocked via vi.stubGlobal since the seed loader calls
 * fetch('/data/seed-it-tech.json') which isn't available in jsdom.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LexioDB } from '@/lib/storage/database';
import { seedIfFresh, STUB_USER_ID, STUB_DECK_ID } from '@/lib/storage/seed-loader';

// ---------------------------------------------------------------------------
// Minimal valid seed fixture (3 cards — enough to test behaviour)
// ---------------------------------------------------------------------------

function makeSeedPayload(count = 3) {
  return {
    version: 1,
    deck: { title: 'IT/Tech Essentials', description: 'Test deck' },
    cards: Array.from({ length: count }, (_, i) => ({
      word: `word-${i + 1}`,
      ipa: `/wɜːrd ${i + 1}/`,
      definition: `Definition of word ${i + 1}.`,
      exampleSentence: `Example sentence for word ${i + 1}.`,
      exampleTranslation: `Vi du cho tu ${i + 1}.`,
      audioWordUrl: null,
      audioSentenceUrl: null,
      imageUrl: null,
      tags: ['test'],
      cefrLevel: 'B1',
      exerciseTypes: ['flashcard'],
    })),
  };
}

function mockFetch(payload: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    }),
  );
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('seedIfFresh', () => {
  let db: LexioDB;

  beforeEach(async () => {
    db = new LexioDB();
    await db.open();
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await db.delete();
  });

  // -------------------------------------------------------------------------
  // Happy path — first seed
  // -------------------------------------------------------------------------

  it('seeds deck, cards, and user_cards on first run', async () => {
    const payload = makeSeedPayload(3);
    mockFetch(payload);

    const result = await seedIfFresh(db);

    expect(result.seeded).toBe(true);
    expect(result.deckId).toBe(STUB_DECK_ID);
    expect(result.cardCount).toBe(3);

    // Verify DB contents
    const deckCount = await db.decks.count();
    expect(deckCount).toBe(1);

    const cards = await db.cards.toArray();
    expect(cards).toHaveLength(3);

    const userCards = await db.userCards.toArray();
    expect(userCards).toHaveLength(3);
  });

  it('creates all user_cards in New stage', async () => {
    mockFetch(makeSeedPayload(3));
    await seedIfFresh(db);

    const userCards = await db.userCards.toArray();
    expect(userCards.every((uc) => uc.stage === 'New')).toBe(true);
  });

  it('sets nextReviewAt to approximately now so all cards are due immediately', async () => {
    const before = Date.now();
    mockFetch(makeSeedPayload(3));
    await seedIfFresh(db);
    const after = Date.now();

    const userCards = await db.userCards.toArray();
    for (const uc of userCards) {
      expect(uc.nextReviewAt).toBeGreaterThanOrEqual(before);
      expect(uc.nextReviewAt).toBeLessThanOrEqual(after);
    }
  });

  it('sets initial SRS state: repetitions=0, easeFactor=2.5, intervalDays=0', async () => {
    mockFetch(makeSeedPayload(3));
    await seedIfFresh(db);

    const userCards = await db.userCards.toArray();
    for (const uc of userCards) {
      expect(uc.repetitions).toBe(0);
      expect(uc.easeFactor).toBe(2.5);
      expect(uc.intervalDays).toBe(0);
    }
  });

  it('seeds stub user streak and XP rows', async () => {
    mockFetch(makeSeedPayload(3));
    await seedIfFresh(db);

    const streak = await db.streaks.get(STUB_USER_ID);
    expect(streak).toBeTruthy();
    expect(streak!.currentStreak).toBe(0);

    const xp = await db.userXp.get(STUB_USER_ID);
    expect(xp).toBeTruthy();
    expect(xp!.level).toBe(1);
    expect(xp!.totalXp).toBe(0);
  });

  it('sets metadata.isSeeded = true after seeding', async () => {
    mockFetch(makeSeedPayload(3));
    await seedIfFresh(db);

    const meta = await db.metadata.get('isSeeded');
    expect(meta?.value).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Idempotency — calling twice must not duplicate data
  // -------------------------------------------------------------------------

  it('is idempotent — calling twice does not duplicate cards', async () => {
    mockFetch(makeSeedPayload(3));
    await seedIfFresh(db);
    await seedIfFresh(db);

    const cards = await db.cards.toArray();
    expect(cards).toHaveLength(3);

    const userCards = await db.userCards.toArray();
    expect(userCards).toHaveLength(3);

    const decks = await db.decks.toArray();
    expect(decks).toHaveLength(1);
  });

  it('returns seeded=false on the second call', async () => {
    mockFetch(makeSeedPayload(3));
    await seedIfFresh(db);

    const second = await seedIfFresh(db);
    expect(second.seeded).toBe(false);
  });

  it('does not call fetch on the second invocation', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeSeedPayload(3),
    });
    vi.stubGlobal('fetch', fetchMock);

    await seedIfFresh(db);
    await seedIfFresh(db);

    // fetch called exactly once
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  it('throws RepositoryError when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    await expect(seedIfFresh(db)).rejects.toThrow('Failed to fetch seed data');
  });

  it('throws RepositoryError when seed file has no cards', async () => {
    mockFetch({ version: 1, deck: { title: 'T', description: '' }, cards: [] });

    await expect(seedIfFresh(db)).rejects.toThrow('Seed file contains no cards');
  });
});

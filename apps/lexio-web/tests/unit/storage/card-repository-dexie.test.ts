/**
 * CardRepositoryDexie tests — uses fake-indexeddb (auto-imported in tests/setup.ts).
 * Each test gets a fresh DB via db.delete() + db.open() in beforeEach.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LexioDB } from '@/lib/storage/database';
import { CardRepositoryDexie } from '@/lib/storage/repositories/card-repository-dexie';
import type { Card, CardId, DeckId } from '@/core/entities/card';
import { NotFoundError } from '@/lib/storage/errors';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCard(overrides: Partial<Card> = {}): Omit<Card, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    deckId: 'deck-001' as DeckId,
    word: 'refactor',
    ipa: '/riːˈfæktər/',
    definition: 'Restructure existing code without changing its behavior.',
    exampleSentence: 'We need to refactor the legacy module.',
    exampleTranslation: 'Chung ta can tai cau truc module cu.',
    audioWordUrl: null,
    audioSentenceUrl: null,
    imageUrl: null,
    tags: ['verb', 'software'],
    cefrLevel: 'B2',
    exerciseTypes: ['flashcard', 'multiple_choice'],
    createdBy: 'user-001',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('CardRepositoryDexie', () => {
  let db: LexioDB;
  let repo: CardRepositoryDexie;

  beforeEach(async () => {
    db = new LexioDB();
    await db.open();
    repo = new CardRepositoryDexie(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  // -------------------------------------------------------------------------
  // create + findById
  // -------------------------------------------------------------------------

  it('creates a card and retrieves it by id', async () => {
    const created = await repo.create(makeCard());
    expect(created.id).toBeTruthy();
    expect(created.word).toBe('refactor');

    const found = await repo.findById(created.id);
    expect(found).not.toBeNull();
    expect(found!.word).toBe('refactor');
    expect(found!.cefrLevel).toBe('B2');
  });

  it('returns null for a non-existent id', async () => {
    const result = await repo.findById('does-not-exist' as CardId);
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // listByDeck
  // -------------------------------------------------------------------------

  it('lists all cards for a specific deck', async () => {
    await repo.create(makeCard({ deckId: 'deck-A' as DeckId, word: 'deploy' }));
    await repo.create(makeCard({ deckId: 'deck-A' as DeckId, word: 'implement' }));
    await repo.create(makeCard({ deckId: 'deck-B' as DeckId, word: 'debug' }));

    const deckA = await repo.listByDeck('deck-A' as DeckId);
    expect(deckA).toHaveLength(2);
    expect(deckA.map((c) => c.word).sort()).toEqual(['deploy', 'implement']);
  });

  it('returns empty array for unknown deck', async () => {
    const result = await repo.listByDeck('deck-unknown' as DeckId);
    expect(result).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // search
  // -------------------------------------------------------------------------

  it('searches cards by term in word field', async () => {
    await repo.create(makeCard({ word: 'deploy' }));
    await repo.create(makeCard({ word: 'implement' }));
    await repo.create(makeCard({ word: 'debug' }));

    const results = await repo.search({ term: 'dep' });
    expect(results).toHaveLength(1);
    expect(results[0]!.word).toBe('deploy');
  });

  it('searches cards by term in definition field', async () => {
    await repo.create(makeCard({ word: 'latency', definition: 'Network delay measurement.' }));
    await repo.create(makeCard({ word: 'throughput', definition: 'Data processed per second.' }));

    const results = await repo.search({ term: 'delay' });
    expect(results).toHaveLength(1);
    expect(results[0]!.word).toBe('latency');
  });

  it('filters search results by CEFR level', async () => {
    await repo.create(makeCard({ word: 'deploy', cefrLevel: 'A2' }));
    await repo.create(makeCard({ word: 'idempotent', cefrLevel: 'B2' }));

    const results = await repo.search({ term: '', cefrLevel: 'A2' });
    expect(results.every((c) => c.cefrLevel === 'A2')).toBe(true);
  });

  it('returns empty array when no cards match search', async () => {
    await repo.create(makeCard({ word: 'deploy' }));
    const results = await repo.search({ term: 'zzznomatch' });
    expect(results).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // update
  // -------------------------------------------------------------------------

  it('updates a card patch', async () => {
    const created = await repo.create(makeCard());
    const updated = await repo.update(created.id, { word: 'rewrite' });
    expect(updated.word).toBe('rewrite');
    expect(updated.id).toBe(created.id);

    const fetched = await repo.findById(created.id);
    expect(fetched!.word).toBe('rewrite');
  });

  it('throws NotFoundError when updating a non-existent card', async () => {
    await expect(repo.update('ghost-id' as CardId, { word: 'x' })).rejects.toThrow(NotFoundError);
  });

  // -------------------------------------------------------------------------
  // delete
  // -------------------------------------------------------------------------

  it('deletes a card', async () => {
    const created = await repo.create(makeCard());
    await repo.delete(created.id);
    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });
});

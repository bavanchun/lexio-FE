/**
 * UserCardRepositoryDexie tests.
 * Focuses on: listDue (compound index range scan), listNew, upsert.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LexioDB } from '@/lib/storage/database';
import { UserCardRepositoryDexie } from '@/lib/storage/repositories/user-card-repository-dexie';
import type { UserCard, UserCardId } from '@/core/entities/user-card';
import type { CardId, DeckId } from '@/core/entities/card';
import { NotFoundError } from '@/lib/storage/errors';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _ucCounter = 0;

function makeUserCard(overrides: Partial<UserCard> = {}): UserCard {
  _ucCounter++;
  const now = new Date().toISOString();
  return {
    id: `uc-${_ucCounter}` as UserCardId,
    userId: 'user-001',
    cardId: `card-${_ucCounter}` as CardId,
    deckId: 'deck-001' as DeckId,
    stage: 'New',
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    consecutiveGoods: 0,
    nextReviewAt: now,
    isFavorite: false,
    personalNote: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('UserCardRepositoryDexie', () => {
  let db: LexioDB;
  let repo: UserCardRepositoryDexie;

  beforeEach(async () => {
    _ucCounter = 0;
    db = new LexioDB();
    await db.open();
    repo = new UserCardRepositoryDexie(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  // -------------------------------------------------------------------------
  // upsert
  // -------------------------------------------------------------------------

  it('upserts a new user card', async () => {
    const uc = makeUserCard();
    const result = await repo.upsert(uc);
    expect(result.id).toBe(uc.id);

    const found = await db.userCards.get(uc.id);
    expect(found).toBeTruthy();
    expect(found!.stage).toBe('New');
  });

  it('overwrites an existing user card on upsert', async () => {
    const uc = makeUserCard();
    await repo.upsert(uc);
    const updated = { ...uc, stage: 'Learning' as const, repetitions: 1 };
    await repo.upsert(updated);

    const found = await db.userCards.get(uc.id);
    expect(found!.stage).toBe('Learning');
    expect(found!.repetitions).toBe(1);
  });

  // -------------------------------------------------------------------------
  // listNew — [userId+stage] index
  // -------------------------------------------------------------------------

  it('listNew returns only New-stage cards for the given user', async () => {
    await repo.upsert(makeUserCard({ userId: 'user-001', stage: 'New' }));
    await repo.upsert(makeUserCard({ userId: 'user-001', stage: 'Learning' }));
    await repo.upsert(makeUserCard({ userId: 'user-001', stage: 'Mature' }));
    await repo.upsert(makeUserCard({ userId: 'user-002', stage: 'New' }));

    const result = await repo.listNew('user-001', 10);
    expect(result).toHaveLength(1);
    expect(result[0]!.stage).toBe('New');
    expect(result[0]!.userId).toBe('user-001');
  });

  it('listNew respects the limit parameter', async () => {
    for (let i = 0; i < 5; i++) {
      await repo.upsert(makeUserCard({ userId: 'user-001', stage: 'New' }));
    }
    const result = await repo.listNew('user-001', 3);
    expect(result).toHaveLength(3);
  });

  // -------------------------------------------------------------------------
  // listDue — [userId+nextReviewAt] compound index range scan
  // -------------------------------------------------------------------------

  it('listDue returns cards with nextReviewAt <= now', async () => {
    const past = new Date(Date.now() - 60_000).toISOString(); // 1 min ago
    const future = new Date(Date.now() + 60_000).toISOString(); // 1 min ahead
    const now = new Date().toISOString();

    await repo.upsert(makeUserCard({ userId: 'user-001', nextReviewAt: past, stage: 'Young' }));
    await repo.upsert(makeUserCard({ userId: 'user-001', nextReviewAt: future, stage: 'Mature' }));

    const due = await repo.listDue('user-001', now, 50);
    expect(due).toHaveLength(1);
    expect(new Date(due[0]!.nextReviewAt).getTime()).toBeLessThanOrEqual(new Date(now).getTime());
  });

  it('listDue includes cards with nextReviewAt exactly equal to now', async () => {
    const exactly = new Date(1_000_000).toISOString(); // deterministic epoch ms
    await repo.upsert(makeUserCard({ userId: 'user-001', nextReviewAt: exactly }));

    const due = await repo.listDue('user-001', exactly, 50);
    expect(due).toHaveLength(1);
  });

  it('listDue excludes cards belonging to other users', async () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const now = new Date().toISOString();

    await repo.upsert(makeUserCard({ userId: 'user-001', nextReviewAt: past }));
    await repo.upsert(makeUserCard({ userId: 'user-002', nextReviewAt: past }));

    const due = await repo.listDue('user-001', now, 50);
    expect(due.every((uc) => uc.userId === 'user-001')).toBe(true);
  });

  it('listDue respects the limit parameter', async () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const now = new Date().toISOString();

    for (let i = 0; i < 10; i++) {
      await repo.upsert(makeUserCard({ userId: 'user-001', nextReviewAt: past }));
    }
    const due = await repo.listDue('user-001', now, 5);
    expect(due).toHaveLength(5);
  });

  it('listDue returns empty array when no cards are due', async () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const now = new Date().toISOString();
    await repo.upsert(makeUserCard({ userId: 'user-001', nextReviewAt: future }));

    const due = await repo.listDue('user-001', now, 50);
    expect(due).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // update
  // -------------------------------------------------------------------------

  it('updates specific fields of a user card', async () => {
    const uc = makeUserCard();
    await repo.upsert(uc);

    const updated = await repo.update(uc.id, { stage: 'Mature', repetitions: 5 });
    expect(updated.stage).toBe('Mature');
    expect(updated.repetitions).toBe(5);
    // Immutable fields preserved
    expect(updated.userId).toBe(uc.userId);
  });

  it('throws NotFoundError when updating non-existent user card', async () => {
    await expect(repo.update('ghost-uc' as UserCardId, { stage: 'Mature' })).rejects.toThrow(
      NotFoundError,
    );
  });
});

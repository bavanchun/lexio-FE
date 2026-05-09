/**
 * Integration test — flashcard study flow with real Dexie (fake-indexeddb).
 * Scenario: 5 new cards seeded → start session → rate each Good →
 * expect session updated with 5 cardsReviewed, XP > 0, streak > 0.
 *
 * No React renderer needed here — pure use-case + repository layer.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';
import { LexioDB, withReviewTransaction } from '@/lib/storage/database';
import { createRepositories } from '@/lib/storage/repositories';
import { startSession } from '@/features/learning/use-cases/start-session';
import { submitReview } from '@/features/learning/use-cases/submit-review';
import type { CardId, DeckId } from '@/core/entities/card';
import type { UserCardId } from '@/core/entities/user-card';
import type { Rating } from '@/core/entities/review';

// ── Helpers ───────────────────────────────────────────────────────────────────

const USER_ID = 'test-user-001';
const DECK_ID = 'test-deck-001' as DeckId;
const NOW = new Date('2024-03-01T10:00:00.000Z');

/**
 * Seeds N cards + matching user-cards directly into the Dexie tables.
 * We use db.table.put() so we control the card IDs and can link user-cards correctly.
 */
async function seedCards(db: LexioDB, count: number): Promise<{ cardIds: CardId[] }> {
  const cardIds: CardId[] = [];

  for (let i = 0; i < count; i++) {
    const cardId = `card-test-${String(i + 1).padStart(3, '0')}` as CardId;
    cardIds.push(cardId);

    // Insert card row directly (bypass repos.cards.create which generates UUID)
    await db.cards.put({
      id: cardId,
      deckId: DECK_ID,
      word: `word${i + 1}`,
      ipa: null,
      ipaUs: null,
      ipaUk: null,
      definition: `Definition of word${i + 1}`,
      exampleSentence: null,
      exampleTranslation: null,
      audioWordUrl: null,
      audioSentenceUrl: null,
      imageUrl: null,
      tags: ['noun'],
      cefrLevel: 'B1',
      exerciseTypes: ['flashcard'],
      collocations: [],
      synonyms: [],
      antonyms: [],
      wordFamily: null,
      etymology: null,
      frequencyRank: null,
      createdBy: USER_ID,
      createdAt: NOW.getTime(),
      updatedAt: NOW.getTime(),
    });

    // Insert user-card row directly — New stage, due at NOW
    await db.userCards.put({
      id: `uc-test-${String(i + 1).padStart(3, '0')}` as UserCardId,
      userId: USER_ID,
      cardId,
      deckId: DECK_ID,
      stage: 'New',
      easeFactor: 2.5,
      intervalDays: 0,
      intervalMinutes: undefined,
      repetitions: 0,
      lapses: 0,
      consecutiveGoods: 0,
      nextReviewAt: NOW.getTime(),
      isFavorite: false,
      personalNote: null,
      createdAt: NOW.getTime(),
      updatedAt: NOW.getTime(),
    });
  }

  return { cardIds };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Flashcard study flow — integration', () => {
  let db: LexioDB;
  let repos: ReturnType<typeof createRepositories>;

  beforeEach(async () => {
    // Delete the shared DB from fake-indexeddb so each test starts clean
    await Dexie.delete('lexio-prototype-v1');
    db = new LexioDB();
    repos = createRepositories(db);
  });

  it('builds a queue of 5 cards after seeding 5 new cards', async () => {
    await seedCards(db, 5);

    const { queue } = await startSession(
      {
        userCardRepo: repos.userCards,
        sessionRepo: repos.sessions,
        streakRepo: repos.streaks,
        cardRepo: repos.cards,
      },
      { deckId: DECK_ID, userId: USER_ID, now: NOW },
    );

    expect(queue.length).toBe(5);
  });

  it('rates all 5 cards Good and records 5 cardsReviewed on the session', async () => {
    await seedCards(db, 5);

    const { session, queue } = await startSession(
      {
        userCardRepo: repos.userCards,
        sessionRepo: repos.sessions,
        streakRepo: repos.streaks,
        cardRepo: repos.cards,
      },
      { deckId: DECK_ID, userId: USER_ID, now: NOW },
    );

    let sessionReviewCount = 0;
    let sessionCorrectCount = 0;

    for (const item of queue) {
      await submitReview(
        {
          userCardRepo: repos.userCards,
          reviewRepo: repos.reviews,
          sessionRepo: repos.sessions,
          streakRepo: repos.streaks,
          userXpRepo: repos.userXp,
          achievementRepo: repos.achievements,
          runInTransaction: <T>(fn: () => Promise<T>) => withReviewTransaction(db, fn),
        },
        {
          userCard: item.userCard,
          rating: 3 as Rating, // Good
          sessionId: session.id,
          durationMs: 4000,
          sessionReviewCount,
          sessionCorrectCount,
          userId: USER_ID,
          now: NOW,
        },
      );
      sessionReviewCount += 1;
      sessionCorrectCount += 1;
    }

    const finalSession = await repos.sessions.findById(session.id);
    expect(finalSession?.cardsReviewed).toBe(5);
  });

  it('accumulates positive XP after 5 Good ratings', async () => {
    await seedCards(db, 5);

    const { session, queue } = await startSession(
      {
        userCardRepo: repos.userCards,
        sessionRepo: repos.sessions,
        streakRepo: repos.streaks,
        cardRepo: repos.cards,
      },
      { deckId: DECK_ID, userId: USER_ID, now: NOW },
    );

    let totalXp = 0;
    let reviewCount = 0;

    for (const item of queue) {
      const result = await submitReview(
        {
          userCardRepo: repos.userCards,
          reviewRepo: repos.reviews,
          sessionRepo: repos.sessions,
          streakRepo: repos.streaks,
          userXpRepo: repos.userXp,
          achievementRepo: repos.achievements,
          runInTransaction: <T>(fn: () => Promise<T>) => withReviewTransaction(db, fn),
        },
        {
          userCard: item.userCard,
          rating: 3 as Rating,
          sessionId: session.id,
          durationMs: 3000,
          sessionReviewCount: reviewCount,
          sessionCorrectCount: reviewCount,
          userId: USER_ID,
          now: NOW,
        },
      );
      totalXp += result.xpEarned;
      reviewCount += 1;
    }

    expect(totalXp).toBeGreaterThan(0);

    const xpRecord = await repos.userXp.findByUser(USER_ID);
    expect(xpRecord?.totalXp).toBe(totalXp);
  });

  it('sets streak to at least 1 after first review of the day', async () => {
    await seedCards(db, 1);

    const { session, queue } = await startSession(
      {
        userCardRepo: repos.userCards,
        sessionRepo: repos.sessions,
        streakRepo: repos.streaks,
        cardRepo: repos.cards,
      },
      { deckId: DECK_ID, userId: USER_ID, now: NOW },
    );

    expect(queue.length).toBeGreaterThan(0);

    const firstItem = queue[0]!;
    await submitReview(
      {
        userCardRepo: repos.userCards,
        reviewRepo: repos.reviews,
        sessionRepo: repos.sessions,
        streakRepo: repos.streaks,
        userXpRepo: repos.userXp,
        achievementRepo: repos.achievements,
        runInTransaction: <T>(fn: () => Promise<T>) => withReviewTransaction(db, fn),
      },
      {
        userCard: firstItem.userCard,
        rating: 3 as Rating,
        sessionId: session.id,
        durationMs: 2000,
        sessionReviewCount: 0,
        sessionCorrectCount: 0,
        userId: USER_ID,
        now: NOW,
      },
    );

    const streak = await repos.streaks.findByUser(USER_ID);
    expect(streak?.currentStreak).toBeGreaterThanOrEqual(1);
  });

  it('awards first_steps achievement on first review', async () => {
    await seedCards(db, 1);

    const { session, queue } = await startSession(
      {
        userCardRepo: repos.userCards,
        sessionRepo: repos.sessions,
        streakRepo: repos.streaks,
        cardRepo: repos.cards,
      },
      { deckId: DECK_ID, userId: USER_ID, now: NOW },
    );

    expect(queue.length).toBeGreaterThan(0);

    const result = await submitReview(
      {
        userCardRepo: repos.userCards,
        reviewRepo: repos.reviews,
        sessionRepo: repos.sessions,
        streakRepo: repos.streaks,
        userXpRepo: repos.userXp,
        achievementRepo: repos.achievements,
        runInTransaction: <T>(fn: () => Promise<T>) => withReviewTransaction(db, fn),
      },
      {
        userCard: queue[0]!.userCard,
        rating: 3 as Rating,
        sessionId: session.id,
        durationMs: 2000,
        sessionReviewCount: 0,
        sessionCorrectCount: 0,
        userId: USER_ID,
        now: NOW,
      },
    );

    expect(result.newAchievements).toContain('first_steps');

    const achievements = await repos.achievements.listByUser(USER_ID);
    expect(achievements.some((a) => a.badgeCode === 'first_steps')).toBe(true);
  });

  it('promotes New cards to a non-New stage after Good rating', async () => {
    await seedCards(db, 1);

    const { session, queue } = await startSession(
      {
        userCardRepo: repos.userCards,
        sessionRepo: repos.sessions,
        streakRepo: repos.streaks,
        cardRepo: repos.cards,
      },
      { deckId: DECK_ID, userId: USER_ID, now: NOW },
    );

    expect(queue.length).toBeGreaterThan(0);

    const originalCard = queue[0]!.userCard;
    expect(originalCard.stage).toBe('New');

    const result = await submitReview(
      {
        userCardRepo: repos.userCards,
        reviewRepo: repos.reviews,
        sessionRepo: repos.sessions,
        streakRepo: repos.streaks,
        userXpRepo: repos.userXp,
        achievementRepo: repos.achievements,
        runInTransaction: <T>(fn: () => Promise<T>) => withReviewTransaction(db, fn),
      },
      {
        userCard: originalCard,
        rating: 3 as Rating,
        sessionId: session.id,
        durationMs: 2000,
        sessionReviewCount: 0,
        sessionCorrectCount: 0,
        userId: USER_ID,
        now: NOW,
      },
    );

    expect(result.updatedUserCard.stage).not.toBe('New');
  });
});

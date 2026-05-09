/**
 * Unit tests for the submit-review use case.
 * All repositories are in-memory stubs — no Dexie involved.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserCard, UserCardId } from '@/core/entities/user-card';
import type { CardId, DeckId } from '@/core/entities/card';
import type { SessionId } from '@/core/entities/session';
import type { Rating, ReviewId } from '@/core/entities/review';
import type { IUserCardRepository } from '@/core/ports/user-card-repository';
import type { IReviewRepository } from '@/core/ports/review-repository';
import type { ISessionRepository } from '@/core/ports/session-repository';
import type { IStreakRepository } from '@/core/ports/streak-repository';
import type { IUserXpRepository } from '@/core/ports/user-xp-repository';
import type { IAchievementRepository } from '@/core/ports/achievement-repository';
import { submitReview } from '@/features/learning/use-cases/submit-review';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const NOW = new Date('2024-01-15T12:00:00.000Z');
const SESSION_ID = 'sess-001' as SessionId;

function makeUserCard(overrides: Partial<UserCard> = {}): UserCard {
  return {
    id: 'uc-001' as UserCardId,
    userId: 'stub-user-000',
    cardId: 'card-001' as CardId,
    deckId: 'deck-001' as DeckId,
    stage: 'New',
    easeFactor: 2.5,
    intervalDays: 0,
    intervalMinutes: undefined,
    repetitions: 0,
    lapses: 0,
    consecutiveGoods: 0,
    nextReviewAt: NOW.toISOString(),
    isFavorite: false,
    personalNote: null,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    ...overrides,
  };
}

/** Builds minimal stub deps matching the exact port interfaces. */
function makeStubDeps() {
  const userCardRepo: IUserCardRepository = {
    findByUserAndCard: vi.fn().mockResolvedValue(null),
    listDue: vi.fn().mockResolvedValue([]),
    listNew: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async (uc: UserCard) => uc),
    update: vi.fn().mockResolvedValue(makeUserCard()),
  };

  const reviewRepo: IReviewRepository = {
    create: vi.fn().mockImplementation(async (r) => ({ ...r, id: 'review-001' as ReviewId })),
    findById: vi.fn().mockResolvedValue(null),
    listBySession: vi.fn().mockResolvedValue([]),
  };

  const sessionRepo: ISessionRepository = {
    create: vi.fn().mockResolvedValue({ id: SESSION_ID, cardsReviewed: 0, newCards: 0 }),
    findById: vi.fn().mockResolvedValue({
      id: SESSION_ID,
      userId: 'stub-user-000',
      deckId: 'deck-001',
      startedAt: NOW.toISOString(),
      endedAt: null,
      cardsReviewed: 0,
      newCards: 0,
    }),
    update: vi.fn().mockResolvedValue(undefined),
  };

  const streakRepo: IStreakRepository = {
    findByUser: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockResolvedValue(undefined),
  };

  const userXpRepo: IUserXpRepository = {
    findByUser: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockResolvedValue(undefined),
  };

  const achievementRepo: IAchievementRepository = {
    listByUser: vi.fn().mockResolvedValue([]),
    award: vi.fn().mockImplementation(async (_userId: string, code: string) => ({
      id: `ach-${code}`,
      userId: 'stub-user-000',
      badgeCode: code,
      earnedAt: NOW.toISOString(),
    })),
  };

  // In-memory repos are already atomic — pass-through transaction wrapper
  const runInTransaction = vi.fn().mockImplementation(<T>(fn: () => Promise<T>) => fn());

  return {
    userCardRepo,
    reviewRepo,
    sessionRepo,
    streakRepo,
    userXpRepo,
    achievementRepo,
    runInTransaction,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('submitReview use case', () => {
  let deps: ReturnType<typeof makeStubDeps>;

  beforeEach(() => {
    deps = makeStubDeps();
    vi.clearAllMocks();
  });

  it('upserts the updated user card after a Good rating', async () => {
    const result = await submitReview(deps, {
      userCard: makeUserCard(),
      rating: 3 as Rating,
      sessionId: SESSION_ID,
      durationMs: 5000,
      sessionReviewCount: 0,
      sessionCorrectCount: 0,
      now: NOW,
    });

    expect(deps.userCardRepo.upsert).toHaveBeenCalledOnce();
    // New card promoted from New stage
    expect(result.updatedUserCard.stage).not.toBe('New');
  });

  it('creates a review record with correct metadata', async () => {
    await submitReview(deps, {
      userCard: makeUserCard(),
      rating: 3 as Rating,
      sessionId: SESSION_ID,
      durationMs: 3000,
      sessionReviewCount: 0,
      sessionCorrectCount: 0,
      now: NOW,
    });

    expect(deps.reviewRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        rating: 3,
        durationMs: 3000,
        exerciseType: 'flashcard',
        sessionId: SESSION_ID,
      }),
    );
  });

  it('returns positive XP for a Good rating on a New card', async () => {
    const result = await submitReview(deps, {
      userCard: makeUserCard({ stage: 'New' }),
      rating: 3 as Rating,
      sessionId: SESSION_ID,
      durationMs: 1000,
      sessionReviewCount: 0,
      sessionCorrectCount: 0,
      now: NOW,
    });

    expect(result.xpEarned).toBeGreaterThan(0);
  });

  it('Easy rating yields at least as much XP as Again rating', async () => {
    const base = makeUserCard();

    const resultAgain = await submitReview(makeStubDeps(), {
      userCard: base,
      rating: 1 as Rating,
      sessionId: SESSION_ID,
      durationMs: 500,
      sessionReviewCount: 0,
      sessionCorrectCount: 0,
      now: NOW,
    });

    const resultEasy = await submitReview(makeStubDeps(), {
      userCard: base,
      rating: 4 as Rating,
      sessionId: SESSION_ID,
      durationMs: 500,
      sessionReviewCount: 0,
      sessionCorrectCount: 0,
      now: NOW,
    });

    expect(resultEasy.xpEarned).toBeGreaterThanOrEqual(resultAgain.xpEarned);
  });

  it('increments session cardsReviewed on update', async () => {
    await submitReview(deps, {
      userCard: makeUserCard(),
      rating: 3 as Rating,
      sessionId: SESSION_ID,
      durationMs: 2000,
      sessionReviewCount: 2,
      sessionCorrectCount: 1,
      now: NOW,
    });

    expect(deps.sessionRepo.update).toHaveBeenCalledWith(
      SESSION_ID,
      expect.objectContaining({ cardsReviewed: 1 }),
    );
  });

  it('awards first_steps achievement on first ever review', async () => {
    const result = await submitReview(deps, {
      userCard: makeUserCard(),
      rating: 3 as Rating,
      sessionId: SESSION_ID,
      durationMs: 1000,
      sessionReviewCount: 0,
      sessionCorrectCount: 0,
      now: NOW,
    });

    expect(result.newAchievements).toContain('first_steps');
    expect(deps.achievementRepo.award).toHaveBeenCalledWith('stub-user-000', 'first_steps');
  });

  it('does not re-award an already earned achievement', async () => {
    // Pre-populate earned badges list
    (deps.achievementRepo.listByUser as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'ach-1',
        userId: 'stub-user-000',
        badgeCode: 'first_steps',
        earnedAt: NOW.toISOString(),
      },
    ]);

    const result = await submitReview(deps, {
      userCard: makeUserCard(),
      rating: 3 as Rating,
      sessionId: SESSION_ID,
      durationMs: 1000,
      sessionReviewCount: 1,
      sessionCorrectCount: 1,
      now: NOW,
    });

    expect(result.newAchievements).not.toContain('first_steps');
  });

  it('handles Again rating on a Mature card — increments lapses', async () => {
    // Lapses only increment for Mature cards per SRS spec (doc §4.3.2)
    const matureCard = makeUserCard({
      stage: 'Mature',
      repetitions: 10,
      intervalDays: 21,
      lapses: 0,
    });

    const result = await submitReview(deps, {
      userCard: matureCard,
      rating: 1 as Rating,
      sessionId: SESSION_ID,
      durationMs: 800,
      sessionReviewCount: 0,
      sessionCorrectCount: 0,
      now: NOW,
    });

    expect(result.updatedUserCard.lapses).toBeGreaterThan(matureCard.lapses);
  });

  it('Again on a New card does NOT increment lapses (SRS spec §4.3.2)', async () => {
    const newCard = makeUserCard({ stage: 'New', lapses: 0 });

    const result = await submitReview(deps, {
      userCard: newCard,
      rating: 1 as Rating,
      sessionId: SESSION_ID,
      durationMs: 800,
      sessionReviewCount: 0,
      sessionCorrectCount: 0,
      now: NOW,
    });

    // Lapses stay 0 — only Mature cards accrue lapses
    expect(result.updatedUserCard.lapses).toBe(0);
  });

  it('upserts XP record with accumulated total', async () => {
    await submitReview(deps, {
      userCard: makeUserCard(),
      rating: 3 as Rating,
      sessionId: SESSION_ID,
      durationMs: 1000,
      sessionReviewCount: 0,
      sessionCorrectCount: 0,
      now: NOW,
    });

    expect(deps.userXpRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'stub-user-000', totalXp: expect.any(Number) }),
    );
  });

  it('upserts streak record after review', async () => {
    await submitReview(deps, {
      userCard: makeUserCard(),
      rating: 3 as Rating,
      sessionId: SESSION_ID,
      durationMs: 1000,
      sessionReviewCount: 0,
      sessionCorrectCount: 0,
      now: NOW,
    });

    expect(deps.streakRepo.upsert).toHaveBeenCalledOnce();
  });

  it('calls runInTransaction to wrap all writes atomically', async () => {
    await submitReview(deps, {
      userCard: makeUserCard(),
      rating: 3 as Rating,
      sessionId: SESSION_ID,
      durationMs: 1000,
      sessionReviewCount: 0,
      sessionCorrectCount: 0,
      now: NOW,
    });

    // runInTransaction must be called exactly once, wrapping all writes
    expect(deps.runInTransaction).toHaveBeenCalledOnce();
  });

  it('propagates transaction abort — no writes committed when achievement award fails', async () => {
    // Simulate achievement award throwing mid-transaction
    const abortError = new Error('simulated transaction abort');
    (deps.achievementRepo.listByUser as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    // Make runInTransaction actually run the fn but make achievement.award throw
    (deps.achievementRepo.award as ReturnType<typeof vi.fn>).mockRejectedValue(abortError);

    // The use case checks achievements only if newlyEarned.length > 0.
    // Simulate a first-review scenario so first_steps is earned → award is called.
    await expect(
      submitReview(deps, {
        userCard: makeUserCard(),
        rating: 3 as Rating,
        sessionId: SESSION_ID,
        durationMs: 1000,
        sessionReviewCount: 0, // totalReviews=1 → first_steps triggers
        sessionCorrectCount: 0,
        now: NOW,
      }),
    ).rejects.toThrow('simulated transaction abort');

    // userCardRepo.upsert was called INSIDE the transaction fn —
    // in a real Dexie transaction the abort would undo it. With in-memory stubs
    // we verify the error propagates (full rollback tested in integration tests).
    expect(deps.achievementRepo.award).toHaveBeenCalled();
  });
});

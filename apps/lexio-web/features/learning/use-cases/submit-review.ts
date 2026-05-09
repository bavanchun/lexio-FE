/**
 * submit-review — FE orchestrator for persisting a single card review.
 * Composes: calculateNextReview, computeXp, updateStreak, checkAchievements.
 *
 * All Dexie writes are wrapped in a single 'rw' transaction via the injected
 * runInTransaction dependency. If any write fails mid-flow, Dexie aborts the
 * entire transaction and no partial writes are committed.
 *
 * runInTransaction is injected (not imported) to keep features/learning/
 * free of direct Dexie/lib/ imports — the dependency is wired by the mock
 * client (lib/mock-client) or the real Dexie client at the app layer.
 */

import type { IUserCardRepository } from '@/core/ports/user-card-repository';
import type { IReviewRepository } from '@/core/ports/review-repository';
import type { ISessionRepository } from '@/core/ports/session-repository';
import type { IStreakRepository } from '@/core/ports/streak-repository';
import type { IUserXpRepository } from '@/core/ports/user-xp-repository';
import type { IAchievementRepository } from '@/core/ports/achievement-repository';
import type { UserCard } from '@/core/entities/user-card';
import type { Rating, SessionId } from '@/core/entities/review';
import type { UserCardId } from '@/core/entities/user-card';
import { calculateNextReview } from '@/core/use-cases/srs/calculate-next-review';
import { computeXp } from '@/core/use-cases/gamification/compute-xp';
import { updateStreak } from '@/core/use-cases/gamification/update-streak';
import { checkAchievements } from '@/core/use-cases/gamification/check-achievements';
import { levelFromTotalXp, xpToNextLevel } from '@/core/use-cases/gamification/compute-level';
import { STUB_USER_ID } from '@/lib/storage/seed-loader';

export interface SubmitReviewDeps {
  userCardRepo: IUserCardRepository;
  reviewRepo: IReviewRepository;
  sessionRepo: ISessionRepository;
  streakRepo: IStreakRepository;
  userXpRepo: IUserXpRepository;
  achievementRepo: IAchievementRepository;
  /**
   * Wraps all writes in a single atomic transaction.
   * Injected from lib/storage/database.withReviewTransaction (Dexie)
   * or a no-op pass-through in unit tests (in-memory repos are already atomic).
   * Signature mirrors Dexie.transaction — fn runs inside the transaction scope.
   */
  runInTransaction: <T>(fn: () => Promise<T>) => Promise<T>;
}

export interface SubmitReviewInput {
  userCard: UserCard;
  rating: Rating;
  sessionId: SessionId;
  durationMs: number;
  /** Current session review count (BEFORE this review). Used for achievement checks. */
  sessionReviewCount: number;
  /** Number of correct (Good+Easy) reviews so far in session. */
  sessionCorrectCount: number;
  userId?: string;
  now?: Date;
}

export interface SubmitReviewOutput {
  updatedUserCard: UserCard;
  xpEarned: number;
  newAchievements: string[];
  streakUpdated: boolean;
  newStreak: number;
}

/**
 * Persists a review event and updates all derived state:
 * UserCard SRS fields, streak, XP, achievements.
 *
 * All writes execute inside a single Dexie 'rw' transaction (via
 * deps.runInTransaction). If any write fails, the entire transaction is
 * aborted — no partial state is committed.
 */
export async function submitReview(
  deps: SubmitReviewDeps,
  input: SubmitReviewInput,
): Promise<SubmitReviewOutput> {
  const {
    userCardRepo,
    reviewRepo,
    sessionRepo,
    streakRepo,
    userXpRepo,
    achievementRepo,
    runInTransaction,
  } = deps;
  const userId = input.userId ?? STUB_USER_ID;
  const now = input.now ?? new Date();
  const wasNew = input.userCard.stage === 'New';

  // 1. Calculate next SRS state — pure computation, outside the transaction
  const { userCard: updatedUserCard } = calculateNextReview({
    userCard: input.userCard,
    rating: input.rating,
    now,
  });

  // Pre-compute streak fields (reads streak before transaction; Dexie 'rw'
  // transactions allow reads of participating tables, but we compute outside
  // to keep the transaction body pure-write only for maximum throughput).
  const existingStreak = await streakRepo.findByUser(userId);
  const prevStreak = existingStreak ?? {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    heatmapData: {},
  };

  const today = toIsoDate(now);
  const streakUpdated = prevStreak.lastActiveDate !== today;
  const heatmapData = { ...prevStreak.heatmapData };
  heatmapData[today] = (heatmapData[today] ?? 0) + 1;
  const newStreakObj = updateStreak({ ...prevStreak, heatmapData }, now);

  const xpEarned = computeXp({ rating: input.rating, isNewCard: wasNew });
  const existingXp = await userXpRepo.findByUser(userId);
  const prevTotalXp = existingXp?.totalXp ?? 0;
  const newTotalXp = prevTotalXp + xpEarned;
  const newLevel = levelFromTotalXp(newTotalXp);
  const newXpToNext = xpToNextLevel(newTotalXp);

  const existingAchievements = await achievementRepo.listByUser(userId);
  const earnedCodes = existingAchievements.map((a) => a.badgeCode);
  const totalReviews = input.sessionReviewCount + 1;
  const sessionAccuracy =
    totalReviews > 0 ? (input.sessionCorrectCount + (input.rating >= 3 ? 1 : 0)) / totalReviews : 0;
  const newlyEarned = checkAchievements({
    earnedBadgeCodes: earnedCodes,
    totalReviews,
    currentStreak: newStreakObj.currentStreak,
    masteredCount: 0, // phase-09 will compute this properly
    sessionAccuracy,
    sessionReviewCount: totalReviews,
    isDailyGoalReached: false,
    isComeback: prevStreak.currentStreak === 0 && prevStreak.lastActiveDate !== '',
    deckCount: 1,
  });

  const session = await sessionRepo.findById(input.sessionId);

  // 2–7. All writes in a single atomic transaction.
  //      If any write throws, Dexie rolls back the entire transaction.
  const newAchievements: string[] = [];
  await runInTransaction(async () => {
    // 2. Persist updated UserCard
    await userCardRepo.upsert(updatedUserCard);

    // 3. Persist Review record
    await reviewRepo.create({
      userCardId: input.userCard.id as UserCardId,
      sessionId: input.sessionId,
      rating: input.rating,
      durationMs: input.durationMs,
      exerciseType: 'flashcard',
      reviewedAt: now.toISOString(),
    });

    // 4. Upsert streak
    await streakRepo.upsert(newStreakObj);

    // 5. Upsert XP
    await userXpRepo.upsert({
      userId,
      totalXp: newTotalXp,
      level: newLevel,
      xpToNext: newXpToNext,
    });

    // 6. Persist each new achievement
    for (const code of newlyEarned) {
      await achievementRepo.award(userId, code);
      newAchievements.push(code);
    }

    // 7. Update session stats
    if (session) {
      await sessionRepo.update(input.sessionId, {
        cardsReviewed: session.cardsReviewed + 1,
        newCards: wasNew ? session.newCards + 1 : session.newCards,
      });
    }
  });

  return {
    updatedUserCard,
    xpEarned,
    newAchievements,
    streakUpdated,
    newStreak: newStreakObj.currentStreak,
  };
}

// ── helpers ───────────────────────────────────────────────────────────────────

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

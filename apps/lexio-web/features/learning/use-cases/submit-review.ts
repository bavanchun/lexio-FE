/**
 * submit-review — FE orchestrator for persisting a single card review.
 * Composes: calculateNextReview, computeXp, updateStreak, checkAchievements.
 * Runs all Dexie writes in a single logical transaction (sequential awaits —
 * Dexie lite transaction not needed since each repo call is independent).
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
 */
export async function submitReview(
  deps: SubmitReviewDeps,
  input: SubmitReviewInput,
): Promise<SubmitReviewOutput> {
  const { userCardRepo, reviewRepo, sessionRepo, streakRepo, userXpRepo, achievementRepo } = deps;
  const userId = input.userId ?? STUB_USER_ID;
  const now = input.now ?? new Date();
  const wasNew = input.userCard.stage === 'New';

  // 1. Calculate next SRS state (pure)
  const { userCard: updatedUserCard } = calculateNextReview({
    userCard: input.userCard,
    rating: input.rating,
    now,
  });

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

  // 4. Update streak
  const existingStreak = await streakRepo.findByUser(userId);
  const prevStreak = existingStreak ?? {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    heatmapData: {},
  };

  const today = toIsoDate(now);
  const alreadyCountedToday = prevStreak.lastActiveDate === today;
  const streakUpdated = !alreadyCountedToday;

  // Update heatmap (+1 for today's review)
  const heatmapData = { ...prevStreak.heatmapData };
  heatmapData[today] = (heatmapData[today] ?? 0) + 1;

  const newStreakObj = updateStreak({ ...prevStreak, heatmapData }, now);
  await streakRepo.upsert(newStreakObj);

  // 5. Compute XP (simple: no daily-goal check in prototype)
  const xpEarned = computeXp({ rating: input.rating, isNewCard: wasNew });

  const existingXp = await userXpRepo.findByUser(userId);
  const prevTotalXp = existingXp?.totalXp ?? 0;
  const newTotalXp = prevTotalXp + xpEarned;
  const newLevel = levelFromTotalXp(newTotalXp);
  const newXpToNext = xpToNextLevel(newTotalXp);

  await userXpRepo.upsert({ userId, totalXp: newTotalXp, level: newLevel, xpToNext: newXpToNext });

  // 6. Check achievements
  const existingAchievements = await achievementRepo.listByUser(userId);
  const earnedCodes = existingAchievements.map((a) => a.badgeCode);

  // Count total reviews (reviews in this session + prior — approximate with sessionReviewCount+1)
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

  // Persist each new achievement
  const newAchievements: string[] = [];
  for (const code of newlyEarned) {
    await achievementRepo.award(userId, code);
    newAchievements.push(code);
  }

  // 7. Update session stats
  const session = await sessionRepo.findById(input.sessionId);
  if (session) {
    await sessionRepo.update(input.sessionId, {
      cardsReviewed: session.cardsReviewed + 1,
      newCards: wasNew ? session.newCards + 1 : session.newCards,
    });
  }

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

/**
 * Shared types for the learning feature.
 * Keeps component and hook signatures clean.
 */

import type { UserCard } from '@/core/entities/user-card';
import type { Rating } from '@/core/entities/review';
import type { Card } from '@/core/entities/card';
import type { SessionId } from '@/core/entities/session';

/** Interval preview shown on each rating button (e.g. "4 d", "10 m"). */
export interface IntervalPreview {
  rating: Rating;
  label: string; // "4 d" | "10 m" | "1 d"
}

/** Result returned after submitting a review. */
export interface SubmitReviewResult {
  xpEarned: number;
  newAchievements: string[];
  streakUpdated: boolean;
  sessionComplete: boolean;
}

/** Session summary shown at the end of a study session. */
export interface SessionSummary {
  sessionId: SessionId;
  cardsReviewed: number;
  correctCount: number; // Good + Easy ratings
  totalDurationMs: number;
  xpEarned: number;
  achievementsEarned: string[];
  streakCurrent: number;
}

/** A queue item pairs a UserCard with its base Card data. */
export interface QueueItem {
  userCard: UserCard;
  card: Card;
}

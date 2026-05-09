/**
 * IReviewRepository port — defines the contract for review event persistence.
 * Implemented by lib/storage (Dexie) in phase-05. Pure TS — no framework imports.
 */

import type { Review, ReviewId, SessionId } from '../entities/review';

export interface IReviewRepository {
  create(review: Omit<Review, 'id'>): Promise<Review>;
  findById(id: ReviewId): Promise<Review | null>;
  listBySession(sessionId: SessionId): Promise<Review[]>;
}

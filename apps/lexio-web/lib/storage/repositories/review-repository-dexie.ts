/**
 * ReviewRepositoryDexie — Dexie adapter implementing IReviewRepository.
 * Dexie types confined here; public signatures use core entities.
 */

import type { IReviewRepository } from '@/core/ports/review-repository';
import type { Review, ReviewId, SessionId } from '@/core/entities/review';
import type { UserCardId } from '@/core/entities/user-card';
import type { LexioDB, ReviewRow } from '../database';
import { RepositoryError } from '../errors';

// ---------------------------------------------------------------------------
// Row ↔ Entity mappers
// ---------------------------------------------------------------------------

function toEntity(row: ReviewRow): Review {
  return {
    id: row.id as ReviewId,
    userCardId: row.userCardId as UserCardId,
    sessionId: row.sessionId as SessionId,
    rating: row.rating,
    durationMs: row.durationMs,
    exerciseType: row.exerciseType as Review['exerciseType'],
    reviewedAt: new Date(row.reviewedAt).toISOString(),
  };
}

function toRow(entity: Review): ReviewRow {
  return {
    id: entity.id,
    userCardId: entity.userCardId,
    sessionId: entity.sessionId,
    rating: entity.rating,
    durationMs: entity.durationMs,
    exerciseType: entity.exerciseType,
    reviewedAt: new Date(entity.reviewedAt).getTime(),
  };
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------

export class ReviewRepositoryDexie implements IReviewRepository {
  constructor(private readonly db: LexioDB) {}

  async create(review: Omit<Review, 'id'>): Promise<Review> {
    try {
      const entity: Review = {
        ...review,
        id: crypto.randomUUID() as ReviewId,
      };
      await this.db.reviews.put(toRow(entity));
      return entity;
    } catch (err) {
      throw new RepositoryError('Failed to create review', err);
    }
  }

  async findById(id: ReviewId): Promise<Review | null> {
    try {
      const row = await this.db.reviews.get(id);
      return row ? toEntity(row) : null;
    } catch (err) {
      throw new RepositoryError(`Failed to find review by id: ${id}`, err);
    }
  }

  async listBySession(sessionId: SessionId): Promise<Review[]> {
    try {
      const rows = await this.db.reviews.where('sessionId').equals(sessionId).toArray();
      return rows.map(toEntity);
    } catch (err) {
      throw new RepositoryError(`Failed to list reviews for session: ${sessionId}`, err);
    }
  }
}

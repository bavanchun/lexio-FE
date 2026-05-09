/**
 * SessionRepositoryDexie — Dexie adapter implementing ISessionRepository.
 * Dexie types confined here; public signatures use core entities.
 */

import type { ISessionRepository } from '@/core/ports/session-repository';
import type { Session, SessionId } from '@/core/entities/session';
import type { DeckId } from '@/core/entities/card';
import type { LexioDB, SessionRow } from '../database';
import { RepositoryError, NotFoundError } from '../errors';

// ---------------------------------------------------------------------------
// Row ↔ Entity mappers
// ---------------------------------------------------------------------------

function toEntity(row: SessionRow): Session {
  return {
    id: row.id as SessionId,
    userId: row.userId,
    deckId: row.deckId as DeckId | null,
    startedAt: new Date(row.startedAt).toISOString(),
    endedAt: row.endedAt != null ? new Date(row.endedAt).toISOString() : null,
    cardsReviewed: row.cardsReviewed,
    newCards: row.newCards,
  };
}

function toRow(entity: Session): SessionRow {
  return {
    id: entity.id,
    userId: entity.userId,
    deckId: entity.deckId,
    startedAt: new Date(entity.startedAt).getTime(),
    endedAt: entity.endedAt != null ? new Date(entity.endedAt).getTime() : null,
    cardsReviewed: entity.cardsReviewed,
    newCards: entity.newCards,
  };
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------

export class SessionRepositoryDexie implements ISessionRepository {
  constructor(private readonly db: LexioDB) {}

  async create(session: Omit<Session, 'id'>): Promise<Session> {
    try {
      const entity: Session = {
        ...session,
        id: crypto.randomUUID() as SessionId,
      };
      await this.db.sessions.put(toRow(entity));
      return entity;
    } catch (err) {
      throw new RepositoryError('Failed to create session', err);
    }
  }

  async findById(id: SessionId): Promise<Session | null> {
    try {
      const row = await this.db.sessions.get(id);
      return row ? toEntity(row) : null;
    } catch (err) {
      throw new RepositoryError(`Failed to find session by id: ${id}`, err);
    }
  }

  async update(id: SessionId, patch: Partial<Omit<Session, 'id'>>): Promise<Session> {
    try {
      const existing = await this.db.sessions.get(id);
      if (!existing) throw new NotFoundError('Session', id);
      const updated: Session = { ...toEntity(existing), ...patch, id };
      await this.db.sessions.put(toRow(updated));
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError(`Failed to update session: ${id}`, err);
    }
  }
}

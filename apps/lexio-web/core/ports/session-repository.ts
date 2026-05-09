/**
 * ISessionRepository port — defines the contract for study session persistence.
 * Implemented by lib/storage (Dexie) in phase-05. Pure TS — no framework imports.
 */

import type { Session, SessionId } from '../entities/session';

export interface ISessionRepository {
  create(session: Omit<Session, 'id'>): Promise<Session>;
  findById(id: SessionId): Promise<Session | null>;
  update(id: SessionId, patch: Partial<Omit<Session, 'id'>>): Promise<Session>;
}

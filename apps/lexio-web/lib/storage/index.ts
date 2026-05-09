/**
 * lib/storage — Dexie (IndexedDB) persistence layer.
 *
 * Public surface:
 *   - db / getDb: Dexie singleton (browser-only)
 *   - createRepositories: factory producing all IXxxRepository adapters
 *   - seedIfFresh: idempotent seed loader
 *   - DbInitGate: client component that opens + seeds on mount
 *   - STUB_USER_ID / STUB_DECK_ID: constants for the prototype stub user
 *
 * lib/ may only import from core/ — never from features/ or app/.
 */

export { db, getDb, LexioDB } from './database';
export type { LexioDB as LexioDBType } from './database';

export { createRepositories } from './repositories';
export type { Repositories } from './repositories';

export { seedIfFresh, STUB_USER_ID, STUB_DECK_ID } from './seed-loader';
export type { SeedResult } from './seed-loader';

export { DbInitGate } from './db-init-gate';

export { RepositoryError, NotFoundError, DuplicateError } from './errors';

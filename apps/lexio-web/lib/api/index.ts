/**
 * API layer entry point — exports the active apiClient singleton.
 *
 * Current implementation: MockApiClient backed by Dexie repositories.
 *
 * To swap to real HTTP: replace the MockApiClient construction below with
 * `new HttpApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL })`.
 * Nothing else needs to change — features/ import only LexioApiClient.
 *
 * NOTE: This module creates the db + repos lazily on first import so that
 * SSR paths that never call the client don't crash on missing IndexedDB.
 */

import type { LexioApiClient } from './client';

export type { LexioApiClient } from './client';
export { queryKeys } from './query-keys';
export { queryClient } from './query-client';

// ---------------------------------------------------------------------------
// Lazy singleton — instantiated on first access in browser only
// ---------------------------------------------------------------------------

let _client: LexioApiClient | null = null;

function buildClient(): LexioApiClient {
  if (typeof window === 'undefined') {
    throw new Error(
      '[lexio/api] apiClient accessed during SSR. ' +
        'Only import apiClient inside client components or event handlers.',
    );
  }

  // Dynamic require keeps Dexie import out of SSR bundle tree.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { LexioDB } = require('@/lib/storage/database') as typeof import('@/lib/storage/database');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createRepositories } =
    require('@/lib/storage/repositories') as typeof import('@/lib/storage/repositories');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockApiClient } = require('./mock-client') as typeof import('./mock-client');

  const db = new LexioDB();
  const repos = createRepositories(db);
  return new MockApiClient(repos);
}

/**
 * The active API client. Lazy-initialised on first access.
 * In tests, create a MockApiClient with a test-scoped db directly.
 */
export function getApiClient(): LexioApiClient {
  if (!_client) {
    _client = buildClient();
  }
  return _client;
}

/**
 * Convenience proxy — most callers destructure `apiClient.decks.listMyDecks(...)`.
 * Use getApiClient() when you need to reset between tests.
 */
export const apiClient = new Proxy({} as LexioApiClient, {
  get(_target, prop: string) {
    return getApiClient()[prop as keyof LexioApiClient];
  },
});

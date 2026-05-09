/**
 * API layer entry point — exports the active apiClient singleton.
 *
 * Current implementation: MockApiClient backed by Dexie repositories.
 *
 * To swap to real HTTP: replace MockApiClient construction below with
 * `new HttpApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL })`.
 * Nothing else needs to change — features/ import only LexioApiClient.
 *
 * BROWSER-ONLY: importing this module in SSR will throw at call time
 * because getDb() guards the Dexie singleton. Only import from client
 * components or inside event handlers.
 */

import type { LexioApiClient } from './client';
import { LexioDB } from '@/lib/storage/database';
import { createRepositories } from '@/lib/storage/repositories';
import { MockApiClient } from './mock-client';

export type { LexioApiClient } from './client';
export { queryKeys } from './query-keys';
export { queryClient } from './query-client';

// ---------------------------------------------------------------------------
// Singleton — module-level, initialised once per browser session.
// In tests create a MockApiClient with a test-scoped db directly.
// ---------------------------------------------------------------------------

function buildClient(): LexioApiClient {
  const db = new LexioDB();
  const repos = createRepositories(db);
  return new MockApiClient(repos);
}

// Module-level singleton — safe because this module is only imported client-side.
// Replace with HttpApiClient in the next iteration when .NET 10 services are scaffolded.
export const apiClient: LexioApiClient = buildClient();

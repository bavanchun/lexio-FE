/**
 * DbInitProvider — re-exports DbInitGate from lib/storage for use in app/ routes.
 *
 * Boundary rationale: app/ → lib/ is disallowed by eslint-plugin-boundaries rules
 * (app may only import from features/ and shared/). This thin wrapper in shared/
 * (which IS allowed to import from lib/) bridges that gap without changing the
 * architecture rules. Shared may import lib per §6.7.7 boundary config.
 */
export { DbInitGate as DbInitProvider } from '@/lib/storage/db-init-gate';

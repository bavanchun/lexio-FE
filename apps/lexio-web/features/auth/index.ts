/**
 * auth feature public barrel.
 * External code MUST import from this barrel — not from internal paths.
 *
 * eslint-disable-next-line boundaries/dependencies — intra-feature re-exports
 * are intentional: this barrel collects sub-module exports for external consumers.
 * The boundaries rule (features→features) fires here because checkInternals:true
 * treats all files under features/** as the same type. Suppressed per-line below.
 */
// eslint-disable-next-line boundaries/dependencies
export { useAuthStore, useIsAuthenticated } from './store/auth-store';
// eslint-disable-next-line boundaries/dependencies
export type { StubUser } from './store/auth-store';
// eslint-disable-next-line boundaries/dependencies
export { RequireAuth } from './components/require-auth';
// eslint-disable-next-line boundaries/dependencies
export { LoginForm } from './components/login-form';

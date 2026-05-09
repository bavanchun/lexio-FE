/**
 * IAuthService port — defines the contract for authentication.
 * Stub-friendly: no JWT, no cookies — just entity-level user resolution.
 * Implemented by lib/api in phase-05 (mock) and later a real auth adapter.
 * Pure TS — no framework imports.
 */

import type { User } from '../entities/user';

export interface IAuthService {
  /** Returns the currently authenticated user, or null if not signed in. */
  getCurrentUser(): Promise<User | null>;
  /**
   * Initiates a magic-link / OTP sign-in for the given email.
   * Resolves when the request is sent (not when confirmed).
   */
  signIn(email: string): Promise<void>;
  /** Signs out the current user and clears local session. */
  signOut(): Promise<void>;
}

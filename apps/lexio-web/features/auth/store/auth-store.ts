/**
 * !!! NOT PRODUCTION !!!
 * Local-only stub auth for the FE-first prototype. There is no real
 * authentication, no JWT, no server validation. The "user" lives in
 * localStorage and can be modified by anyone with devtools open.
 * Replace with real Identity service (.NET 10) before exposing this
 * to any non-developer. Tracked: phase-2 of the doc roadmap.
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StubUser {
  id: string;
  email: string;
  displayName: string;
  role: 'Learner';
  isVerified: false;
  createdAt: string; // ISO string (serialisable for localStorage)
  lastLoginAt: string;
}

interface AuthState {
  user: StubUser | null;
  /**
   * Zustand persist rehydrates asynchronously from localStorage.
   * Until rehydration is complete, `_hasHydrated` is false and route guards
   * must show a loading spinner rather than redirect — otherwise they see
   * `user === null` transiently and send the logged-in user to /login.
   */
  _hasHydrated: boolean;
  signIn: (email: string, displayName: string) => Promise<void>;
  signOut: () => void;
  setHydrated: () => void;
}

/** Deterministic uuid-v4 from crypto.randomUUID() (available in all modern browsers + Node 18+) */
function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto.randomUUID is unavailable
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,

      signIn: async (email: string, displayName: string) => {
        const now = new Date().toISOString();
        const user: StubUser = {
          id: newId(),
          email: email.trim().toLowerCase(),
          displayName: displayName.trim() || email.split('@')[0] || email,
          role: 'Learner',
          isVerified: false,
          createdAt: now,
          lastLoginAt: now,
        };
        set({ user });
      },

      signOut: () => {
        set({ user: null });
      },

      setHydrated: () => {
        set({ _hasHydrated: true });
      },
    }),
    {
      name: 'lexio-auth-stub',
      onRehydrateStorage: () => (state) => {
        // Called when rehydration from localStorage finishes.
        // Sets _hasHydrated so route guards can safely read auth state.
        state?.setHydrated();
      },
    },
  ),
);

/** Convenience selector — true when a user object is present in the store. */
export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => s.user !== null);
}

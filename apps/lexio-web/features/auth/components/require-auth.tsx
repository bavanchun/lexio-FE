'use client';

/**
 * RequireAuth — client-side route guard for (app)/* routes.
 *
 * Waits for Zustand persist rehydration (_hasHydrated) before making
 * a redirect decision — avoids the race condition where `user === null`
 * transiently right after a page load when the user IS logged in.
 *
 * Pattern: render Skeleton during rehydration, redirect to /login when
 * confirmed unauthenticated, render children when authenticated.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// eslint-disable-next-line boundaries/dependencies -- intra-feature: same feature barrel sub-module
import { useAuthStore } from '../store/auth-store';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    // Only redirect once rehydration is complete to avoid false negatives.
    if (hasHydrated && !user) {
      router.replace('/login');
    }
  }, [hasHydrated, user, router]);

  // Show nothing (or a spinner) while waiting for rehydration.
  if (!hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-indigo-600" />
      </div>
    );
  }

  // Not authenticated — return null while the redirect effect fires.
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

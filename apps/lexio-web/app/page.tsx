'use client';

/**
 * Root page — redirects based on auth state.
 * Authenticated → /dashboard, unauthenticated → /login.
 * /design showcase remains accessible at (showcase)/design.
 *
 * Uses client component to read Zustand store (client-only persist).
 * Shows loading spinner during Zustand rehydration to avoid flash-redirect.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth-store';

export default function RootPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(user ? '/dashboard' : '/login');
  }, [hasHydrated, user, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-indigo-600" />
    </div>
  );
}

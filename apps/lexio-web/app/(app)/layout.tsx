'use client';

/**
 * Authenticated app layout — composes DB init, auth guard, and app shell.
 *
 * Boundary notes:
 *   - DbInitProvider comes from shared/ (wraps lib/storage/DbInitGate)
 *   - RequireAuth + useAuthStore come from features/auth (app → features is allowed)
 *   - AppShell comes from shared/ (app → shared is allowed)
 *
 * Auth context (displayName, signOut) is read here (app layer, allowed to import
 * features/) and injected into AppShell as props so shared/ stays features/-free.
 */
import { useRouter } from 'next/navigation';
import { DbInitProvider } from '@/shared/components/providers/db-init-provider';
import { QueryProvider } from '@/shared/components/providers/query-provider';
import { RequireAuth } from '@/features/auth';
import { useAuthStore } from '@/features/auth';
import { useDashboardStats } from '@/features/statistics';
import { AppShell } from '@/shared/components/layout/app-shell';

/** Stub user ID — matches seed-loader.ts STUB_USER_ID. app/ cannot import lib/ directly. */
const FALLBACK_USER_ID = 'stub-user-000';

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  // Fetch live streak + level for top bar — app/ → features/ is allowed.
  const userId = user?.id ?? FALLBACK_USER_ID;
  const { data: statsData } = useDashboardStats(userId);

  function handleSignOut() {
    signOut();
    router.push('/login');
  }

  return (
    <AppShell
      displayName={user?.displayName ?? ''}
      onSignOut={handleSignOut}
      streak={statsData?.streak.current}
      level={statsData?.xp.level}
    >
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <DbInitProvider>
        <RequireAuth>
          <AuthenticatedShell>{children}</AuthenticatedShell>
        </RequireAuth>
      </DbInitProvider>
    </QueryProvider>
  );
}

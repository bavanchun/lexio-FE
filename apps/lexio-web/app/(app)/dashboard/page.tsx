'use client';

/**
 * /dashboard — statistics dashboard page (phase-09).
 * Client component: reads auth store for userId + displayName,
 * then delegates to DashboardClient (TanStack Query + lazy heatmap).
 *
 * app/ → features/ is allowed per ESLint boundaries rules.
 */
import { useAuthStore } from '@/features/auth';
import { DashboardClient } from '@/features/statistics';

/** Stub user ID — matches seed-loader.ts STUB_USER_ID. app/ cannot import lib/ directly. */
const FALLBACK_USER_ID = 'stub-user-000';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  // Fall back to stub user ID when auth store hasn't hydrated yet —
  // DashboardClient disables queries when userId is empty, so no false fetch.
  const userId = user?.id ?? FALLBACK_USER_ID;
  const displayName = user?.displayName ?? '';

  return <DashboardClient userId={userId} displayName={displayName} />;
}

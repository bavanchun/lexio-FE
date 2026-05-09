'use client';

/**
 * AppShell — authenticated layout wrapper: NOT-PROD banner + TopBar + SidebarNav + main.
 * Receives auth context (displayName, onSignOut) from the (app) layout (which lives in
 * app/ and is permitted to import from features/). This keeps shared/ free of features/ deps.
 */
import { NotProdBanner } from '@/shared/components/not-prod-banner';
import { SidebarNav } from './sidebar-nav';
import { TopBar } from './top-bar';

interface AppShellProps {
  children: React.ReactNode;
  /** Display name of the authenticated user — for avatar initials. */
  displayName: string;
  /** Called when user clicks "Sign out" in the avatar dropdown. */
  onSignOut: () => void;
  /** Current day streak — passed from (app)/layout.tsx. */
  streak?: number;
  /** Current XP level — passed from (app)/layout.tsx. */
  level?: number;
}

export function AppShell({ children, displayName, onSignOut, streak, level }: AppShellProps) {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <NotProdBanner />
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar displayName={displayName} onSignOut={onSignOut} streak={streak} level={level} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

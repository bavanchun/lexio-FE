'use client';

/**
 * AppShell — authenticated layout wrapper: NOT-PROD banner + offline indicator
 * + TopBar + SidebarNav + main.
 *
 * Receives auth context (displayName, onSignOut) from the (app) layout (which lives in
 * app/ and is permitted to import from features/). This keeps shared/ free of features/ deps.
 *
 * dropdownExtras: passed through to TopBar so the app/ layer can inject
 * features-layer items (e.g. NotificationToggle) without a boundary violation.
 */
import { NotProdBanner } from '@/shared/components/not-prod-banner';
import { OfflineIndicator } from '@/shared/components/offline-indicator';
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
  /**
   * Extra DropdownMenuItems rendered inside the avatar dropdown after Settings.
   * Injected from app/ layer to avoid shared → features boundary violation.
   */
  dropdownExtras?: React.ReactNode;
}

export function AppShell({
  children,
  displayName,
  onSignOut,
  streak,
  level,
  dropdownExtras,
}: AppShellProps) {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <NotProdBanner />
      <OfflineIndicator />
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            displayName={displayName}
            onSignOut={onSignOut}
            streak={streak}
            level={level}
            dropdownExtras={dropdownExtras}
          />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

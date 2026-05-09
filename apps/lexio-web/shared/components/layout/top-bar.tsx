'use client';

/**
 * TopBar — right-aligned: streak counter, XP indicator, theme toggle, avatar dropdown.
 * Phase-06: streak=0, level=1, xp=0 hardcoded. Phase-09 wires real data via TanStack Query.
 *
 * Receives user display name and signOut callback via props (no direct features/ import)
 * so shared/ boundary is respected — caller (app/ layout) injects auth context.
 */
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/shared/components/theme-toggle';
import { StreakIcon, XpIcon, ChevronDownIcon, SignOutIcon, SettingsIcon } from '@/shared/icons';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import Link from 'next/link';

interface TopBarProps {
  displayName: string;
  onSignOut: () => void;
}

/** Derive two-letter initials from a display name. */
function getInitials(displayName: string): string {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function TopBar({ displayName, onSignOut }: TopBarProps) {
  const t = useTranslations();
  const initials = getInitials(displayName);

  return (
    <header className="flex h-14 items-center justify-end gap-3 border-b border-border bg-card px-4">
      {/* Streak counter — phase-06 placeholder value */}
      <div
        className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400"
        title={t('shell.streak')}
      >
        <StreakIcon className="h-4 w-4" strokeWidth={1.5} />
        <span className="font-medium tabular-nums">0</span>
      </div>

      {/* XP / level indicator — phase-06 placeholder value */}
      <div
        className="flex items-center gap-1 text-sm text-violet-600 dark:text-violet-400"
        title={`${t('shell.level')} 1 · 0 ${t('shell.xp')}`}
      >
        <XpIcon className="h-4 w-4" strokeWidth={1.5} />
        <span className="font-medium tabular-nums">Lv 1</span>
      </div>

      <ThemeToggle />

      {/* Avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 px-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
              {initials}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" strokeWidth={1.5} />
              {t('nav.settings')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onSignOut}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <SignOutIcon className="h-4 w-4" strokeWidth={1.5} />
            {t('shell.signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

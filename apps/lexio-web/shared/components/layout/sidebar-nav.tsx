'use client';

/**
 * SidebarNav — fixed left rail, w-60 (fixed, no collapse in phase-06).
 * Logo wordmark at top, then nav items using canonical icon mapping §12.7.2.
 * Active route detected via usePathname(). Sentence case labels.
 */
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  DashboardIcon,
  DecksIcon,
  StudyIcon,
  StatsIcon,
  AchievementsIcon,
  SettingsIcon,
} from '@/shared/icons';
import { NavItem } from './nav-item';
import type { LucideIcon } from 'lucide-react';

interface NavEntry {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

const NAV_ENTRIES: NavEntry[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: DashboardIcon },
  { href: '/decks', labelKey: 'decks', icon: DecksIcon },
  { href: '/study/new', labelKey: 'study', icon: StudyIcon },
  { href: '/stats', labelKey: 'stats', icon: StatsIcon },
  { href: '/achievements', labelKey: 'achievements', icon: AchievementsIcon },
  { href: '/settings', labelKey: 'settings', icon: SettingsIcon },
];

export function SidebarNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-card">
      {/* Logo wordmark */}
      <div className="flex h-14 items-center px-4 font-medium">
        <span className="text-lg text-indigo-600 dark:text-indigo-400">Lexio</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main navigation">
        {NAV_ENTRIES.map(({ href, labelKey, icon }) => (
          <NavItem
            key={href}
            href={href}
            label={t(labelKey)}
            icon={icon}
            isActive={pathname === href || pathname.startsWith(href + '/')}
          />
        ))}
      </nav>
    </aside>
  );
}

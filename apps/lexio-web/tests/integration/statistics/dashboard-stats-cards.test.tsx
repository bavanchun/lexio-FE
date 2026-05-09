/**
 * Integration test — statistics dashboard stat cards.
 * Renders TodayCard, StreakCard, XpCard with props and verifies output.
 * Uses mocked apiClient to avoid Dexie/IndexedDB dependency.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// ── next/navigation mock ──────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard',
}));

// ── next/link mock ────────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { TodayCard } from '@/features/statistics/components/today-card';

import { StreakCard } from '@/features/statistics/components/streak-card';

import { XpCard } from '@/features/statistics/components/xp-card';

// ─────────────────────────────────────────────────────────────────────────────

describe('TodayCard', () => {
  it('renders due count, new count, and estimated time', () => {
    render(<TodayCard dueCount={12} newCount={8} estimatedMinutes={6} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('6 min')).toBeInTheDocument();
  });

  it('shows "Start studying" CTA with deckId when there is work to do', () => {
    render(<TodayCard dueCount={5} newCount={0} estimatedMinutes={1} deckId="deck-001" />);

    const link = screen.getByRole('link', { name: /start studying/i });
    expect(link).toHaveAttribute('href', '/study/new?deckId=deck-001');
  });

  it('falls back to /decks when no deckId provided', () => {
    render(<TodayCard dueCount={5} newCount={0} estimatedMinutes={1} />);

    const link = screen.getByRole('link', { name: /start studying/i });
    expect(link).toHaveAttribute('href', '/decks');
  });

  it('hides CTA when both due and new are zero', () => {
    render(<TodayCard dueCount={0} newCount={0} estimatedMinutes={0} />);

    expect(screen.queryByRole('link', { name: /start studying/i })).not.toBeInTheDocument();
  });

  it('shows dash for estimated time when zero', () => {
    render(<TodayCard dueCount={0} newCount={0} estimatedMinutes={0} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('StreakCard', () => {
  it('renders current streak and longest record', () => {
    render(<StreakCard current={7} longest={14} />);

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Best: 14 days')).toBeInTheDocument();
  });

  it('renders zero streak without error', () => {
    render(<StreakCard current={0} longest={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Best: 0 days')).toBeInTheDocument();
  });
});

describe('XpCard', () => {
  it('renders level and xp-to-next caption', () => {
    render(<XpCard level={3} totalXp={250} xpToNext={50} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('50 xp to level 4')).toBeInTheDocument();
  });

  it('renders progress bar with correct aria attributes', () => {
    render(<XpCard level={2} totalXp={100} xpToNext={100} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });
});

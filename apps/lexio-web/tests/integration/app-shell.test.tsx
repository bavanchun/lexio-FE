/**
 * Integration tests — AppShell rendering.
 * Covers: authenticated layout, sidebar nav items, theme toggle, active route.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from '@/shared/components/layout/app-shell';

// ── next/navigation mock ──────────────────────────────────────────────────────
const mockPathname = vi.fn(() => '/dashboard');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => mockPathname(),
}));

// ── next-intl mock ────────────────────────────────────────────────────────────
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => {
    const keys: Record<string, string> = {
      dashboard: 'Dashboard',
      decks: 'Decks',
      study: 'Study',
      stats: 'Stats',
      achievements: 'Achievements',
      settings: 'Settings',
      signOut: 'Sign out',
      streak: 'Day streak',
      level: 'Level',
      xp: 'XP',
      'nav.settings': 'Settings',
      'shell.signOut': 'Sign out',
    };
    return (key: string) => keys[key] ?? key;
  },
}));

// ── next/link mock ────────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockPathname.mockReturnValue('/dashboard');
});

const defaultProps = {
  displayName: 'Alice Learner',
  onSignOut: vi.fn(),
};

describe('AppShell', () => {
  it('renders the NOT-PROD banner', () => {
    render(<AppShell {...defaultProps}>Content</AppShell>);
    expect(screen.getByRole('alert')).toHaveTextContent(/stub authentication/i);
  });

  it('renders all 6 sidebar nav items', () => {
    render(<AppShell {...defaultProps}>Content</AppShell>);
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav.querySelectorAll('a').length).toBe(6);
  });

  it('renders the Lexio wordmark in the sidebar', () => {
    render(<AppShell {...defaultProps}>Content</AppShell>);
    expect(screen.getByText('Lexio')).toBeInTheDocument();
  });

  it('renders children inside main', () => {
    render(
      <AppShell {...defaultProps}>
        <p>test content</p>
      </AppShell>,
    );
    expect(screen.getByText('test content')).toBeInTheDocument();
  });

  it('marks the active route link with aria-current=page', () => {
    mockPathname.mockReturnValue('/dashboard');
    render(<AppShell {...defaultProps}>Content</AppShell>);
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark non-active route with aria-current', () => {
    mockPathname.mockReturnValue('/dashboard');
    render(<AppShell {...defaultProps}>Content</AppShell>);
    const decksLink = screen.getByRole('link', { name: /decks/i });
    expect(decksLink).not.toHaveAttribute('aria-current', 'page');
  });
});

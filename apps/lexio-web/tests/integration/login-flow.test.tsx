/**
 * Integration test — login flow.
 * Renders LoginForm, fills email + displayName, submits, verifies:
 *   - store user is populated with role Learner
 *   - router.push('/dashboard') is called
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAuthStore } from '@/features/auth/store/auth-store';

// ── next/navigation mock ──────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => '/',
}));

// ── next-intl mock ────────────────────────────────────────────────────────────
vi.mock('next-intl', () => ({
  useTranslations: () => {
    const keys: Record<string, string> = {
      signIn: 'Sign in to Lexio',
      signInDescription: 'Email and display name only — this prototype does not store passwords.',
      email: 'Email',
      displayName: 'Display name',
      signInButton: 'Continue',
      signingIn: 'Signing in…',
    };
    return (key: string) => keys[key] ?? key;
  },
}));

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  useAuthStore.setState({ user: null, _hasHydrated: false });
  localStorage.clear();
  mockPush.mockClear();
});

describe('LoginForm integration', () => {
  it('renders email and display name fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('signs in and redirects to /dashboard on valid submit', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Alice' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    const { user } = useAuthStore.getState();
    expect(user).not.toBeNull();
    expect(user?.email).toBe('alice@example.com');
    expect(user?.displayName).toBe('Alice');
    expect(user?.role).toBe('Learner');
    expect(user?.isVerified).toBe(false);
  });

  it('rejects invalid email format', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Bob' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});

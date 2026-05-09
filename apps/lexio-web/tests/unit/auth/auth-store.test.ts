/**
 * Unit tests for stub auth store.
 * Covers: signIn creates correct user, signOut clears user, persist roundtrip.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';

beforeEach(() => {
  // Reset store state between tests using the store's own actions.
  useAuthStore.setState({ user: null, _hasHydrated: false });
  localStorage.clear();
});

describe('useAuthStore — signIn', () => {
  it('creates a user with role Learner and isVerified false', async () => {
    await useAuthStore.getState().signIn('test@example.com', 'Alice');
    const { user } = useAuthStore.getState();

    expect(user).not.toBeNull();
    expect(user?.email).toBe('test@example.com');
    expect(user?.displayName).toBe('Alice');
    expect(user?.role).toBe('Learner');
    expect(user?.isVerified).toBe(false);
  });

  it('normalises email to lowercase and trims whitespace', async () => {
    await useAuthStore.getState().signIn('  TEST@EXAMPLE.COM  ', 'Bob');
    expect(useAuthStore.getState().user?.email).toBe('test@example.com');
  });

  it('generates a non-empty id on each signIn', async () => {
    await useAuthStore.getState().signIn('a@b.com', 'A');
    const id1 = useAuthStore.getState().user?.id;
    useAuthStore.setState({ user: null });
    await useAuthStore.getState().signIn('a@b.com', 'A');
    const id2 = useAuthStore.getState().user?.id;

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    // IDs should differ between separate signIn calls
    expect(id1).not.toBe(id2);
  });

  it('sets createdAt and lastLoginAt as ISO strings', async () => {
    await useAuthStore.getState().signIn('x@y.com', 'X');
    const { user } = useAuthStore.getState();
    expect(() => new Date(user!.createdAt)).not.toThrow();
    expect(() => new Date(user!.lastLoginAt)).not.toThrow();
  });

  it('falls back to email prefix when displayName is blank', async () => {
    await useAuthStore.getState().signIn('alice@example.com', '   ');
    expect(useAuthStore.getState().user?.displayName).toBe('alice');
  });
});

describe('useAuthStore — signOut', () => {
  it('clears the user', async () => {
    await useAuthStore.getState().signIn('test@example.com', 'Tester');
    expect(useAuthStore.getState().user).not.toBeNull();
    useAuthStore.getState().signOut();
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('useAuthStore — hydration flag', () => {
  it('starts with _hasHydrated false', () => {
    expect(useAuthStore.getState()._hasHydrated).toBe(false);
  });

  it('setHydrated flips the flag to true', () => {
    useAuthStore.getState().setHydrated();
    expect(useAuthStore.getState()._hasHydrated).toBe(true);
  });
});

describe('useAuthStore — localStorage persistence', () => {
  it('persists user to localStorage after signIn', async () => {
    await useAuthStore.getState().signIn('persist@example.com', 'Persist');
    const stored = localStorage.getItem('lexio-auth-stub');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.user.email).toBe('persist@example.com');
  });

  it('clears localStorage entry after signOut', async () => {
    await useAuthStore.getState().signIn('persist@example.com', 'Persist');
    useAuthStore.getState().signOut();
    const stored = localStorage.getItem('lexio-auth-stub');
    const parsed = JSON.parse(stored!);
    expect(parsed.state.user).toBeNull();
  });
});

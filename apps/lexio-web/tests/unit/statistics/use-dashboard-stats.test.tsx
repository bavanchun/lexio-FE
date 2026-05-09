/**
 * Unit tests — useDashboardStats hook.
 * Mocks apiClient to verify composition of streak, XP, and card queue counts.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ── Mock apiClient ─────────────────────────────────────────────────────────
vi.mock('@/lib/api', () => ({
  apiClient: {
    stats: {
      getStreak: vi.fn(),
      getXp: vi.fn(),
    },
    userCards: {
      getDueQueue: vi.fn(),
      getNewQueue: vi.fn(),
    },
  },
  queryKeys: {
    stats: {
      dashboard: (userId: string) => ['stats', userId, 'dashboard'] as const,
    },
  },
}));

// eslint-disable-next-line boundaries/dependencies
import { useDashboardStats } from '@/features/statistics/services/stats-queries';
import { apiClient } from '@/lib/api';

// ── Fixtures ────────────────────────────────────────────────────────────────
const stubStreak = {
  userId: 'u1',
  currentStreak: 7,
  longestStreak: 14,
  lastActiveDate: '2026-05-09',
  heatmapData: {},
};
const stubXp = { userId: 'u1', totalXp: 250, level: 3, xpToNext: 50 };

// ── Wrapper ─────────────────────────────────────────────────────────────────
function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

// ── Typed mock references ────────────────────────────────────────────────────
const mockGetStreak = apiClient.stats.getStreak as ReturnType<typeof vi.fn>;
const mockGetXp = apiClient.stats.getXp as ReturnType<typeof vi.fn>;
const mockGetDue = apiClient.userCards.getDueQueue as ReturnType<typeof vi.fn>;
const mockGetNew = apiClient.userCards.getNewQueue as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDashboardStats', () => {
  it('composes streak + XP + queue counts correctly', async () => {
    // 3 due cards × 10s + 2 new × 30s = 90s = 2 min (ceil)
    mockGetStreak.mockResolvedValue(stubStreak);
    mockGetXp.mockResolvedValue(stubXp);
    mockGetDue.mockResolvedValue([{}, {}, {}]); // 3 due
    mockGetNew.mockResolvedValue([{}, {}]); // 2 new

    const { result } = renderHook(() => useDashboardStats('u1'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data.streak.current).toBe(7);
    expect(data.streak.longest).toBe(14);
    expect(data.xp.level).toBe(3);
    expect(data.xp.xpToNext).toBe(50);
    expect(data.todayDueCount).toBe(3);
    expect(data.todayNewCount).toBe(2);
    expect(data.estimatedMinutes).toBe(2); // ceil(90/60) = 2
  });

  it('returns zero defaults when streak and XP are null', async () => {
    mockGetStreak.mockResolvedValue(null);
    mockGetXp.mockResolvedValue(null);
    mockGetDue.mockResolvedValue([]);
    mockGetNew.mockResolvedValue([]);

    const { result } = renderHook(() => useDashboardStats('u1'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data.streak.current).toBe(0);
    expect(data.xp.level).toBe(1);
    expect(data.estimatedMinutes).toBe(0);
  });

  it('is disabled when userId is empty', async () => {
    const { result } = renderHook(() => useDashboardStats(''), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(mockGetStreak).not.toHaveBeenCalled();
  });

  it('surfaces error state on API failure', async () => {
    mockGetStreak.mockRejectedValue(new Error('DB error'));
    mockGetXp.mockResolvedValue(stubXp);
    mockGetDue.mockResolvedValue([]);
    mockGetNew.mockResolvedValue([]);

    const { result } = renderHook(() => useDashboardStats('u1'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
  });
});

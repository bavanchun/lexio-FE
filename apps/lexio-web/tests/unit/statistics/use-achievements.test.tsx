/**
 * Unit tests — useAchievements hook.
 * Verifies earned vs locked badge separation using canonical badge list.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Achievement, AchievementId } from '@/core/entities/achievement';

// ── Mock apiClient ─────────────────────────────────────────────────────────
vi.mock('@/lib/api', () => ({
  apiClient: {
    stats: { getAchievements: vi.fn() },
  },
  queryKeys: {
    stats: {
      achievements: (userId: string) => ['stats', userId, 'achievements'] as const,
    },
  },
}));

import { useAchievements, CANONICAL_BADGES } from '@/features/statistics/services/stats-queries';
import { apiClient } from '@/lib/api';

const mockGetAchievements = apiClient.stats.getAchievements as ReturnType<typeof vi.fn>;

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

const totalBadges = CANONICAL_BADGES.length;

describe('useAchievements', () => {
  it('correctly separates earned and locked badges', async () => {
    const earned: Achievement[] = [
      {
        id: 'a1' as AchievementId,
        userId: 'u1',
        badgeCode: 'first_steps',
        earnedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'a2' as AchievementId,
        userId: 'u1',
        badgeCode: 'week_warrior',
        earnedAt: '2026-02-01T00:00:00.000Z',
      },
    ];
    mockGetAchievements.mockResolvedValue(earned);

    const { result } = renderHook(() => useAchievements('u1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data.earned).toHaveLength(2);
    expect(data.locked).toHaveLength(totalBadges - 2);

    // Earned badges must have earnedAt
    const firstSteps = data.earned.find((b) => b.code === 'first_steps');
    expect(firstSteps).toBeDefined();
    expect(firstSteps?.earnedAt).toBe('2026-01-01T00:00:00.000Z');

    // Locked badges must NOT include first_steps or week_warrior
    const lockedCodes = data.locked.map((b) => b.code);
    expect(lockedCodes).not.toContain('first_steps');
    expect(lockedCodes).not.toContain('week_warrior');
  });

  it('returns all badges as locked when no achievements earned', async () => {
    mockGetAchievements.mockResolvedValue([]);

    const { result } = renderHook(() => useAchievements('u1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data.earned).toHaveLength(0);
    expect(data.locked).toHaveLength(totalBadges);
  });

  it('returns all badges as earned when all achievements unlocked', async () => {
    const allEarned: Achievement[] = CANONICAL_BADGES.map((b, i) => ({
      id: `a${i}` as AchievementId,
      userId: 'u1',
      badgeCode: b.code,
      earnedAt: '2026-01-01T00:00:00.000Z',
    }));
    mockGetAchievements.mockResolvedValue(allEarned);

    const { result } = renderHook(() => useAchievements('u1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data.earned).toHaveLength(totalBadges);
    expect(data.locked).toHaveLength(0);
  });

  it('ignores unknown badgeCodes not in canonical list', async () => {
    const withUnknown: Achievement[] = [
      {
        id: 'a1' as AchievementId,
        userId: 'u1',
        badgeCode: 'mystery_badge',
        earnedAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    mockGetAchievements.mockResolvedValue(withUnknown);

    const { result } = renderHook(() => useAchievements('u1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    // mystery_badge is not in canonical list — earned array is empty
    expect(data.earned).toHaveLength(0);
    // All canonical badges remain locked
    expect(data.locked).toHaveLength(totalBadges);
  });

  it('is disabled when userId is empty', async () => {
    const { result } = renderHook(() => useAchievements(''), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(mockGetAchievements).not.toHaveBeenCalled();
  });
});

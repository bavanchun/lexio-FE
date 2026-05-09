/**
 * Unit tests — useHeatmap hook.
 * Verifies date-range filtering from streak.heatmapData.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ── Mock apiClient ─────────────────────────────────────────────────────────
vi.mock('@/lib/api', () => ({
  apiClient: {
    stats: { getStreak: vi.fn() },
  },
  queryKeys: {
    stats: {
      heatmap: (userId: string, from: string, to: string) =>
        ['stats', userId, 'heatmap', from, to] as const,
    },
  },
}));

import { useHeatmap } from '@/features/statistics/services/stats-queries';
import { apiClient } from '@/lib/api';

const mockGetStreak = apiClient.stats.getStreak as ReturnType<typeof vi.fn>;

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useHeatmap', () => {
  it('filters heatmap data to the requested date range', async () => {
    mockGetStreak.mockResolvedValue({
      userId: 'u1',
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: '2026-05-09',
      heatmapData: {
        '2026-01-01': 5,
        '2026-03-15': 20,
        '2026-05-09': 10,
        '2025-12-01': 3, // outside range
      },
    });

    const { result } = renderHook(() => useHeatmap('u1', '2026-01-01', '2026-05-09'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data['2026-01-01']).toBe(5);
    expect(data['2026-03-15']).toBe(20);
    expect(data['2026-05-09']).toBe(10);
    expect(data['2025-12-01']).toBeUndefined(); // filtered out
  });

  it('returns empty object when streak is null', async () => {
    mockGetStreak.mockResolvedValue(null);

    const { result } = renderHook(() => useHeatmap('u1', '2026-01-01', '2026-05-09'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({});
  });

  it('returns empty object when heatmapData is empty', async () => {
    mockGetStreak.mockResolvedValue({
      userId: 'u1',
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      heatmapData: {},
    });

    const { result } = renderHook(() => useHeatmap('u1', '2026-01-01', '2026-05-09'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({});
  });

  it('is disabled when userId is empty', async () => {
    const { result } = renderHook(() => useHeatmap('', '2026-01-01', '2026-05-09'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(mockGetStreak).not.toHaveBeenCalled();
  });
});

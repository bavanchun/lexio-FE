/**
 * Tests for updateStreak — doc §4.4.1
 * Covers same-day no-op, consecutive day increment, gap reset, DST boundary.
 */

import { describe, it, expect } from 'vitest';
import { updateStreak, toIsoDateString } from '@/core/use-cases/gamification/update-streak';
import type { Streak } from '@/core/entities/streak';

function makeStreak(overrides: Partial<Streak> = {}): Streak {
  return {
    userId: 'user-001',
    currentStreak: 1,
    longestStreak: 5,
    lastActiveDate: '2024-01-14',
    heatmapData: {},
    ...overrides,
  };
}

describe('updateStreak — same calendar day', () => {
  it('returns unchanged streak when reviewing same day', () => {
    const streak = makeStreak({ lastActiveDate: '2024-01-15' });
    const now = new Date('2024-01-15T08:00:00');
    const result = updateStreak(streak, now);
    expect(result).toBe(streak); // exact same reference
  });

  it('no-op even if same-day review happens later in the day', () => {
    const streak = makeStreak({ lastActiveDate: '2024-01-15', currentStreak: 3 });
    const now = new Date('2024-01-15T23:59:59');
    const result = updateStreak(streak, now);
    expect(result.currentStreak).toBe(3);
  });
});

describe('updateStreak — consecutive day', () => {
  it('increments currentStreak by 1', () => {
    const streak = makeStreak({ lastActiveDate: '2024-01-14', currentStreak: 3 });
    const result = updateStreak(streak, new Date('2024-01-15T10:00:00'));
    expect(result.currentStreak).toBe(4);
  });

  it('updates lastActiveDate to today', () => {
    const streak = makeStreak({ lastActiveDate: '2024-01-14' });
    const result = updateStreak(streak, new Date('2024-01-15T10:00:00'));
    expect(result.lastActiveDate).toBe('2024-01-15');
  });

  it('updates longestStreak when currentStreak surpasses it', () => {
    const streak = makeStreak({ lastActiveDate: '2024-01-14', currentStreak: 5, longestStreak: 5 });
    const result = updateStreak(streak, new Date('2024-01-15T10:00:00'));
    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(6);
  });

  it('does NOT update longestStreak when currentStreak is already below it', () => {
    const streak = makeStreak({
      lastActiveDate: '2024-01-14',
      currentStreak: 3,
      longestStreak: 10,
    });
    const result = updateStreak(streak, new Date('2024-01-15T10:00:00'));
    expect(result.longestStreak).toBe(10);
  });
});

describe('updateStreak — gap ≥ 2 days (reset)', () => {
  it('resets currentStreak to 1 after 2-day gap', () => {
    const streak = makeStreak({ lastActiveDate: '2024-01-13', currentStreak: 7 });
    const result = updateStreak(streak, new Date('2024-01-15T10:00:00'));
    expect(result.currentStreak).toBe(1);
  });

  it('resets after longer gap', () => {
    const streak = makeStreak({ lastActiveDate: '2024-01-01', currentStreak: 30 });
    const result = updateStreak(streak, new Date('2024-01-15T10:00:00'));
    expect(result.currentStreak).toBe(1);
  });

  it('does NOT decrease longestStreak on reset', () => {
    const streak = makeStreak({
      lastActiveDate: '2024-01-01',
      currentStreak: 30,
      longestStreak: 30,
    });
    const result = updateStreak(streak, new Date('2024-01-15T10:00:00'));
    expect(result.longestStreak).toBe(30);
  });

  it('updates lastActiveDate on reset', () => {
    const streak = makeStreak({ lastActiveDate: '2024-01-01' });
    const result = updateStreak(streak, new Date('2024-01-15T10:00:00'));
    expect(result.lastActiveDate).toBe('2024-01-15');
  });
});

describe('updateStreak — DST boundary safety', () => {
  it('consecutive days across month boundary (Jan 31 → Feb 1) increment streak', () => {
    const streak = makeStreak({ lastActiveDate: '2024-01-31', currentStreak: 2 });
    const result = updateStreak(streak, new Date('2024-02-01T10:00:00'));
    expect(result.currentStreak).toBe(3);
  });

  it('consecutive days across year boundary (Dec 31 → Jan 1) increment streak', () => {
    const streak = makeStreak({ lastActiveDate: '2023-12-31', currentStreak: 10 });
    const result = updateStreak(streak, new Date('2024-01-01T00:01:00'));
    expect(result.currentStreak).toBe(11);
  });
});

describe('updateStreak — missing lastActiveDate (new user)', () => {
  it('treats empty lastActiveDate as day 1 (diff=1) and increments streak', () => {
    // lastStr is falsy → diff defaults to 1 → consecutive path
    const streak = makeStreak({ lastActiveDate: '', currentStreak: 0, longestStreak: 0 });
    const result = updateStreak(streak, new Date('2024-01-15T10:00:00'));
    expect(result.currentStreak).toBe(1);
    expect(result.lastActiveDate).toBe('2024-01-15');
  });
});

describe('toIsoDateString', () => {
  it('converts Date to YYYY-MM-DD in local time', () => {
    const d = new Date('2024-06-15T10:00:00');
    const str = toIsoDateString(d);
    expect(str).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(str).toBe(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    );
  });
});

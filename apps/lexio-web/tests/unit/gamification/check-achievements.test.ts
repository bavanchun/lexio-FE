/**
 * Tests for checkAchievements — doc §4.4.4
 * Verifies each badge triggers exactly once on correct condition and
 * is not re-awarded when already earned.
 */

import { describe, it, expect } from 'vitest';
import { checkAchievements } from '@/core/use-cases/gamification/check-achievements';
import type { AchievementContext } from '@/core/use-cases/gamification/check-achievements';

function makeCtx(overrides: Partial<AchievementContext> = {}): AchievementContext {
  return {
    earnedBadgeCodes: [],
    totalReviews: 0,
    currentStreak: 0,
    masteredCount: 0,
    sessionAccuracy: 0,
    sessionReviewCount: 0,
    isDailyGoalReached: false,
    isComeback: false,
    deckCount: 0,
    ...overrides,
  };
}

describe('checkAchievements — first_steps', () => {
  it('awards first_steps on first review (totalReviews=1)', () => {
    const result = checkAchievements(makeCtx({ totalReviews: 1 }));
    expect(result).toContain('first_steps');
  });

  it('does not award first_steps when already earned', () => {
    const result = checkAchievements(
      makeCtx({ totalReviews: 1, earnedBadgeCodes: ['first_steps'] }),
    );
    expect(result).not.toContain('first_steps');
  });

  it('does not award first_steps when totalReviews=0', () => {
    expect(checkAchievements(makeCtx({ totalReviews: 0 }))).not.toContain('first_steps');
  });
});

describe('checkAchievements — week_warrior', () => {
  it('awards week_warrior at streak=7', () => {
    expect(checkAchievements(makeCtx({ currentStreak: 7 }))).toContain('week_warrior');
  });

  it('awards week_warrior at streak > 7', () => {
    expect(checkAchievements(makeCtx({ currentStreak: 14 }))).toContain('week_warrior');
  });

  it('does not award week_warrior at streak=6', () => {
    expect(checkAchievements(makeCtx({ currentStreak: 6 }))).not.toContain('week_warrior');
  });

  it('does not re-award week_warrior if already earned', () => {
    const result = checkAchievements(
      makeCtx({ currentStreak: 7, earnedBadgeCodes: ['week_warrior'] }),
    );
    expect(result).not.toContain('week_warrior');
  });
});

describe('checkAchievements — month_master', () => {
  it('awards month_master at streak=30', () => {
    expect(checkAchievements(makeCtx({ currentStreak: 30 }))).toContain('month_master');
  });

  it('does not award month_master at streak=29', () => {
    expect(checkAchievements(makeCtx({ currentStreak: 29 }))).not.toContain('month_master');
  });
});

describe('checkAchievements — century_club', () => {
  it('awards century_club at masteredCount=100', () => {
    expect(checkAchievements(makeCtx({ masteredCount: 100 }))).toContain('century_club');
  });

  it('does not award at masteredCount=99', () => {
    expect(checkAchievements(makeCtx({ masteredCount: 99 }))).not.toContain('century_club');
  });
});

describe('checkAchievements — kilo_crusher', () => {
  it('awards kilo_crusher at masteredCount=1000', () => {
    expect(checkAchievements(makeCtx({ masteredCount: 1000 }))).toContain('kilo_crusher');
  });

  it('does not award at masteredCount=999', () => {
    expect(checkAchievements(makeCtx({ masteredCount: 999 }))).not.toContain('kilo_crusher');
  });
});

describe('checkAchievements — speed_demon', () => {
  it('awards speed_demon at accuracy ≥ 0.9 with ≥ 10 reviews', () => {
    expect(checkAchievements(makeCtx({ sessionAccuracy: 0.9, sessionReviewCount: 10 }))).toContain(
      'speed_demon',
    );
  });

  it('awards speed_demon at accuracy > 0.9', () => {
    expect(checkAchievements(makeCtx({ sessionAccuracy: 0.95, sessionReviewCount: 15 }))).toContain(
      'speed_demon',
    );
  });

  it('does not award speed_demon with < 10 reviews even at 100% accuracy', () => {
    expect(
      checkAchievements(makeCtx({ sessionAccuracy: 1.0, sessionReviewCount: 9 })),
    ).not.toContain('speed_demon');
  });

  it('does not award speed_demon with accuracy < 0.9', () => {
    expect(
      checkAchievements(makeCtx({ sessionAccuracy: 0.89, sessionReviewCount: 20 })),
    ).not.toContain('speed_demon');
  });
});

describe('checkAchievements — perfect_day', () => {
  it('awards perfect_day when goal reached and accuracy = 1.0', () => {
    expect(
      checkAchievements(makeCtx({ isDailyGoalReached: true, sessionAccuracy: 1.0 })),
    ).toContain('perfect_day');
  });

  it('does not award perfect_day when goal not reached', () => {
    expect(
      checkAchievements(makeCtx({ isDailyGoalReached: false, sessionAccuracy: 1.0 })),
    ).not.toContain('perfect_day');
  });

  it('does not award perfect_day when accuracy < 1.0', () => {
    expect(
      checkAchievements(makeCtx({ isDailyGoalReached: true, sessionAccuracy: 0.99 })),
    ).not.toContain('perfect_day');
  });
});

describe('checkAchievements — comeback_kid', () => {
  it('awards comeback_kid when isComeback = true', () => {
    expect(checkAchievements(makeCtx({ isComeback: true }))).toContain('comeback_kid');
  });

  it('does not award comeback_kid when isComeback = false', () => {
    expect(checkAchievements(makeCtx({ isComeback: false }))).not.toContain('comeback_kid');
  });
});

describe('checkAchievements — polyglot_path', () => {
  it('awards polyglot_path at deckCount=5', () => {
    expect(checkAchievements(makeCtx({ deckCount: 5 }))).toContain('polyglot_path');
  });

  it('does not award polyglot_path at deckCount=4', () => {
    expect(checkAchievements(makeCtx({ deckCount: 4 }))).not.toContain('polyglot_path');
  });
});

describe('checkAchievements — no false positives', () => {
  it('returns empty array for blank context', () => {
    expect(checkAchievements(makeCtx())).toEqual([]);
  });

  it('can award multiple badges in one call', () => {
    const result = checkAchievements(
      makeCtx({
        totalReviews: 1,
        currentStreak: 7,
        isComeback: false,
      }),
    );
    expect(result).toContain('first_steps');
    expect(result).toContain('week_warrior');
    expect(result).toHaveLength(2);
  });

  it('never re-awards any already-earned badge', () => {
    const allCodes = [
      'first_steps',
      'week_warrior',
      'month_master',
      'century_club',
      'kilo_crusher',
      'speed_demon',
      'perfect_day',
      'comeback_kid',
      'polyglot_path',
    ];
    const result = checkAchievements(
      makeCtx({
        earnedBadgeCodes: allCodes,
        totalReviews: 100,
        currentStreak: 365,
        masteredCount: 2000,
        sessionAccuracy: 1.0,
        sessionReviewCount: 50,
        isDailyGoalReached: true,
        isComeback: true,
        deckCount: 10,
      }),
    );
    expect(result).toEqual([]);
  });
});

/**
 * Tests for xpRequiredForLevel, levelFromTotalXp, xpToNextLevel — doc §4.4.2
 * Quadratic curve: xp_required(n) = floor(100 * (n-1)^1.5)
 */

import { describe, it, expect } from 'vitest';
import {
  xpRequiredForLevel,
  levelFromTotalXp,
  xpToNextLevel,
} from '@/core/use-cases/gamification/compute-level';

describe('xpRequiredForLevel', () => {
  it('level 1 requires 0 XP', () => {
    expect(xpRequiredForLevel(1)).toBe(0);
  });

  it('level 2 requires floor(100 * 1^1.5) = 100 XP', () => {
    expect(xpRequiredForLevel(2)).toBe(100);
  });

  it('level 3 requires floor(100 * 2^1.5) = floor(282.84) = 282 XP', () => {
    expect(xpRequiredForLevel(3)).toBe(282);
  });

  it('level 10 requires floor(100 * 9^1.5) = floor(2700) = 2700 XP', () => {
    expect(xpRequiredForLevel(10)).toBe(2700);
  });

  it('level 5 requires floor(100 * 4^1.5) = floor(800) = 800 XP', () => {
    expect(xpRequiredForLevel(5)).toBe(800);
  });

  it('thresholds are monotonically increasing', () => {
    for (let lvl = 2; lvl <= 20; lvl++) {
      expect(xpRequiredForLevel(lvl)).toBeGreaterThan(xpRequiredForLevel(lvl - 1));
    }
  });
});

describe('levelFromTotalXp', () => {
  it('0 XP → level 1', () => {
    expect(levelFromTotalXp(0)).toBe(1);
  });

  it('50 XP → level 1 (below level-2 threshold of 100)', () => {
    expect(levelFromTotalXp(50)).toBe(1);
  });

  it('99 XP → level 1', () => {
    expect(levelFromTotalXp(99)).toBe(1);
  });

  it('100 XP → level 2', () => {
    expect(levelFromTotalXp(100)).toBe(2);
  });

  it('281 XP → level 2 (below level-3 threshold of 282)', () => {
    expect(levelFromTotalXp(281)).toBe(2);
  });

  it('282 XP → level 3', () => {
    expect(levelFromTotalXp(282)).toBe(3);
  });

  it('2700 XP → level 10', () => {
    expect(levelFromTotalXp(2700)).toBe(10);
  });

  it('large XP value returns a sensible level', () => {
    expect(levelFromTotalXp(100_000)).toBeGreaterThan(10);
  });
});

describe('xpToNextLevel', () => {
  it('at 0 XP, next level (2) needs 100 XP → xpToNext = 100', () => {
    expect(xpToNextLevel(0)).toBe(100);
  });

  it('at 100 XP (level 2), next level (3) needs 282 → xpToNext = 182', () => {
    expect(xpToNextLevel(100)).toBe(182);
  });

  it('exactly at threshold → xpToNext = gap to next threshold', () => {
    // level 3 at 282 XP, level 4 = floor(100*3^1.5)=floor(519.6)=519 → 519-282=237
    expect(xpToNextLevel(282)).toBe(519 - 282);
  });
});

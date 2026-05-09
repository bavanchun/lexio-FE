/**
 * Tests for computeXp — doc §4.4.2
 */

import { describe, it, expect } from 'vitest';
import { computeXp } from '@/core/use-cases/gamification/compute-xp';

describe('computeXp — base XP per rating', () => {
  it('new card → 10 XP regardless of rating', () => {
    expect(computeXp({ rating: 1, isNewCard: true })).toBe(10);
    expect(computeXp({ rating: 2, isNewCard: true })).toBe(10);
    expect(computeXp({ rating: 3, isNewCard: true })).toBe(10);
    expect(computeXp({ rating: 4, isNewCard: true })).toBe(10);
  });

  it('Again (1) → 2 XP', () => {
    expect(computeXp({ rating: 1, isNewCard: false })).toBe(2);
  });

  it('Hard (2) → 4 XP', () => {
    expect(computeXp({ rating: 2, isNewCard: false })).toBe(4);
  });

  it('Good (3) → 8 XP', () => {
    expect(computeXp({ rating: 3, isNewCard: false })).toBe(8);
  });

  it('Easy (4) → 12 XP', () => {
    expect(computeXp({ rating: 4, isNewCard: false })).toBe(12);
  });
});

describe('computeXp — daily goal bonus', () => {
  it('adds +50 when isDailyGoalReached = true', () => {
    expect(computeXp({ rating: 3, isNewCard: false, isDailyGoalReached: true })).toBe(58);
  });

  it('no bonus when isDailyGoalReached = false', () => {
    expect(computeXp({ rating: 3, isNewCard: false, isDailyGoalReached: false })).toBe(8);
  });

  it('no bonus when isDailyGoalReached is omitted (defaults false)', () => {
    expect(computeXp({ rating: 4, isNewCard: false })).toBe(12);
  });

  it('new card + daily goal → 10 + 50 = 60', () => {
    expect(computeXp({ rating: 3, isNewCard: true, isDailyGoalReached: true })).toBe(60);
  });
});

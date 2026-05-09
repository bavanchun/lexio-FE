/**
 * Tests for computeNewCardCap and getSessionQueue — doc §4.3.3
 * Covers all adaptive cap boundary cases from researcher-b test matrix.
 */

import { describe, it, expect } from 'vitest';
import { computeNewCardCap, getSessionQueue } from '@/core/use-cases/srs/get-session-queue';
import { makeUserCard } from './helpers';

const DEFAULT_TARGET = 15;

// ── computeNewCardCap ─────────────────────────────────────────────────────────

describe('computeNewCardCap', () => {
  it('dueToday > 200 → cap = 0 (highest priority)', () => {
    expect(
      computeNewCardCap({ dueTodayCount: 250, baseTarget: DEFAULT_TARGET, retention7d: 0.5 }),
    ).toBe(0);
  });

  it('dueToday = 201 → cap = 0', () => {
    expect(
      computeNewCardCap({ dueTodayCount: 201, baseTarget: DEFAULT_TARGET, retention7d: 0.95 }),
    ).toBe(0);
  });

  it('dueToday = 200 → 200 rule does NOT apply (strictly >200); falls through to 100-rule', () => {
    // 200 > 100 → max(5, floor(15*0.5)) = max(5, 7) = 7
    expect(
      computeNewCardCap({ dueTodayCount: 200, baseTarget: DEFAULT_TARGET, retention7d: 0.95 }),
    ).toBe(7);
  });

  it('dueToday > 100 (150) → max(5, floor(15*0.5)) = 7', () => {
    expect(
      computeNewCardCap({ dueTodayCount: 150, baseTarget: DEFAULT_TARGET, retention7d: 0.95 }),
    ).toBe(7);
  });

  it('dueToday = 101 → cap = max(5, floor(15*0.5)) = 7', () => {
    expect(
      computeNewCardCap({ dueTodayCount: 101, baseTarget: DEFAULT_TARGET, retention7d: 0.95 }),
    ).toBe(7);
  });

  it('dueToday = 100 → 100-rule does NOT apply (strictly >100); retention rule applies', () => {
    // retention 0.95 ≥ 0.80 → returns baseTarget = 15
    expect(
      computeNewCardCap({ dueTodayCount: 100, baseTarget: DEFAULT_TARGET, retention7d: 0.95 }),
    ).toBe(15);
  });

  it('dueToday = 99 → below both caps; retention 0.95 → full target', () => {
    expect(
      computeNewCardCap({ dueTodayCount: 99, baseTarget: DEFAULT_TARGET, retention7d: 0.95 }),
    ).toBe(15);
  });

  it('retention < 0.80 (0.75) with low due → floor(15*0.7) = 10', () => {
    expect(
      computeNewCardCap({ dueTodayCount: 50, baseTarget: DEFAULT_TARGET, retention7d: 0.75 }),
    ).toBe(10);
  });

  it('retention exactly 0.80 → no penalty (threshold is strictly <0.80)', () => {
    expect(
      computeNewCardCap({ dueTodayCount: 50, baseTarget: DEFAULT_TARGET, retention7d: 0.8 }),
    ).toBe(15);
  });

  it('retention 0.79 → penalty applies → floor(15*0.7)=10', () => {
    expect(
      computeNewCardCap({ dueTodayCount: 50, baseTarget: DEFAULT_TARGET, retention7d: 0.79 }),
    ).toBe(10);
  });

  it('dueToday=250 with retention=0.50 → 200-rule wins → 0', () => {
    expect(
      computeNewCardCap({ dueTodayCount: 250, baseTarget: DEFAULT_TARGET, retention7d: 0.5 }),
    ).toBe(0);
  });

  it('small baseTarget where 50% floor < 5 → max(5, …) enforces minimum', () => {
    // baseTarget=8, 50%=4 → max(5,4)=5
    expect(computeNewCardCap({ dueTodayCount: 150, baseTarget: 8, retention7d: 0.95 })).toBe(5);
  });
});

// ── getSessionQueue ───────────────────────────────────────────────────────────

describe('getSessionQueue', () => {
  const makeDueCards = (n: number) =>
    Array.from({ length: n }, (_, i) => makeUserCard({ stage: 'Young', intervalDays: 5 + i }));

  const makeNewCards = (n: number) =>
    Array.from({ length: n }, () => makeUserCard({ stage: 'New' }));

  it('returns all due cards unchanged', () => {
    const due = makeDueCards(5);
    const { dueQueue } = getSessionQueue({
      dueCards: due,
      newCards: [],
      dueTodayCount: 5,
      retention7d: 0.9,
      target: 15,
    });
    expect(dueQueue).toHaveLength(5);
    expect(dueQueue).toBe(due); // same reference
  });

  it('caps new cards to appliedNewLimit', () => {
    const newCards = makeNewCards(20);
    const { newQueue, appliedNewLimit } = getSessionQueue({
      dueCards: [],
      newCards,
      dueTodayCount: 5,
      retention7d: 0.9,
      target: 10,
    });
    expect(newQueue).toHaveLength(10);
    expect(appliedNewLimit).toBe(10);
  });

  it('cap is 0 when dueToday > 200 → newQueue is empty', () => {
    const { newQueue, appliedNewLimit } = getSessionQueue({
      dueCards: [],
      newCards: makeNewCards(10),
      dueTodayCount: 250,
      retention7d: 0.9,
      target: 15,
    });
    expect(newQueue).toHaveLength(0);
    expect(appliedNewLimit).toBe(0);
  });

  it('appliedNewLimit capped by available new cards if fewer than computed cap', () => {
    const { newQueue, appliedNewLimit } = getSessionQueue({
      dueCards: [],
      newCards: makeNewCards(3),
      dueTodayCount: 5,
      retention7d: 0.9,
      target: 15,
    });
    expect(newQueue).toHaveLength(3);
    expect(appliedNewLimit).toBe(3);
  });

  it('retention penalty applies when retention7d < 0.80', () => {
    const { appliedNewLimit } = getSessionQueue({
      dueCards: [],
      newCards: makeNewCards(20),
      dueTodayCount: 50,
      retention7d: 0.75,
      target: 15,
    });
    // floor(15 * 0.7) = 10
    expect(appliedNewLimit).toBe(10);
  });
});

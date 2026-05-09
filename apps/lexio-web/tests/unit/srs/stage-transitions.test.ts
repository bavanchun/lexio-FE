/**
 * Tests for transitionStage — doc §4.3.2
 * Table-driven coverage of all stage × rating combinations.
 */

import { describe, it, expect } from 'vitest';
import { transitionStage } from '@/core/use-cases/srs/stage-transitions';

// ── New ───────────────────────────────────────────────────────────────────────

describe('New stage transitions', () => {
  it('New + Again → stays New', () => {
    expect(
      transitionStage({
        currentStage: 'New',
        rating: 1,
        newConsecutiveGoods: 0,
        newIntervalDays: 0,
      }),
    ).toBe('New');
  });

  it('New + Hard → stays New', () => {
    expect(
      transitionStage({
        currentStage: 'New',
        rating: 2,
        newConsecutiveGoods: 0,
        newIntervalDays: 0,
      }),
    ).toBe('New');
  });

  it('New + Good → Learning', () => {
    expect(
      transitionStage({
        currentStage: 'New',
        rating: 3,
        newConsecutiveGoods: 1,
        newIntervalDays: 1,
      }),
    ).toBe('Learning');
  });

  it('New + Easy → Young (graduating skip)', () => {
    expect(
      transitionStage({
        currentStage: 'New',
        rating: 4,
        newConsecutiveGoods: 0,
        newIntervalDays: 4,
      }),
    ).toBe('Young');
  });
});

// ── Learning ──────────────────────────────────────────────────────────────────

describe('Learning stage transitions', () => {
  it('Learning + Again → stays Learning', () => {
    expect(
      transitionStage({
        currentStage: 'Learning',
        rating: 1,
        newConsecutiveGoods: 0,
        newIntervalDays: 0,
      }),
    ).toBe('Learning');
  });

  it('Learning + Hard → stays Learning', () => {
    expect(
      transitionStage({
        currentStage: 'Learning',
        rating: 2,
        newConsecutiveGoods: 0,
        newIntervalDays: 1,
      }),
    ).toBe('Learning');
  });

  it('Learning + Good (first, consecutiveGoods=1) → stays Learning', () => {
    expect(
      transitionStage({
        currentStage: 'Learning',
        rating: 3,
        newConsecutiveGoods: 1,
        newIntervalDays: 1,
      }),
    ).toBe('Learning');
  });

  it('Learning + Good (second, consecutiveGoods=2) → Young', () => {
    expect(
      transitionStage({
        currentStage: 'Learning',
        rating: 3,
        newConsecutiveGoods: 2,
        newIntervalDays: 3,
      }),
    ).toBe('Young');
  });

  it('Learning + Easy → Young (instant promotion)', () => {
    expect(
      transitionStage({
        currentStage: 'Learning',
        rating: 4,
        newConsecutiveGoods: 0,
        newIntervalDays: 4,
      }),
    ).toBe('Young');
  });
});

// ── Young ─────────────────────────────────────────────────────────────────────

describe('Young stage transitions', () => {
  it('Young + Again → Learning', () => {
    expect(
      transitionStage({
        currentStage: 'Young',
        rating: 1,
        newConsecutiveGoods: 0,
        newIntervalDays: 0,
      }),
    ).toBe('Learning');
  });

  it('Young + Hard with interval ≤ 21 → stays Young', () => {
    expect(
      transitionStage({
        currentStage: 'Young',
        rating: 2,
        newConsecutiveGoods: 0,
        newIntervalDays: 12,
      }),
    ).toBe('Young');
  });

  it('Young + Good with interval ≤ 21 → stays Young', () => {
    expect(
      transitionStage({
        currentStage: 'Young',
        rating: 3,
        newConsecutiveGoods: 0,
        newIntervalDays: 18,
      }),
    ).toBe('Young');
  });

  it('Young + Good with interval exactly 21 → stays Young (threshold is strictly >21)', () => {
    expect(
      transitionStage({
        currentStage: 'Young',
        rating: 3,
        newConsecutiveGoods: 0,
        newIntervalDays: 21,
      }),
    ).toBe('Young');
  });

  it('Young + Good with interval 22 → Mature', () => {
    expect(
      transitionStage({
        currentStage: 'Young',
        rating: 3,
        newConsecutiveGoods: 0,
        newIntervalDays: 22,
      }),
    ).toBe('Mature');
  });

  it('Young + Easy with interval > 21 → Mature', () => {
    expect(
      transitionStage({
        currentStage: 'Young',
        rating: 4,
        newConsecutiveGoods: 0,
        newIntervalDays: 30,
      }),
    ).toBe('Mature');
  });

  it('Young + Easy with interval ≤ 21 → stays Young', () => {
    expect(
      transitionStage({
        currentStage: 'Young',
        rating: 4,
        newConsecutiveGoods: 0,
        newIntervalDays: 10,
      }),
    ).toBe('Young');
  });
});

// ── Mature ────────────────────────────────────────────────────────────────────

describe('Mature stage transitions', () => {
  it('Mature + Again → Learning', () => {
    expect(
      transitionStage({
        currentStage: 'Mature',
        rating: 1,
        newConsecutiveGoods: 0,
        newIntervalDays: 0,
      }),
    ).toBe('Learning');
  });

  it('Mature + Hard → stays Mature', () => {
    expect(
      transitionStage({
        currentStage: 'Mature',
        rating: 2,
        newConsecutiveGoods: 0,
        newIntervalDays: 36,
      }),
    ).toBe('Mature');
  });

  it('Mature + Good → stays Mature', () => {
    expect(
      transitionStage({
        currentStage: 'Mature',
        rating: 3,
        newConsecutiveGoods: 0,
        newIntervalDays: 60,
      }),
    ).toBe('Mature');
  });

  it('Mature + Easy → stays Mature', () => {
    expect(
      transitionStage({
        currentStage: 'Mature',
        rating: 4,
        newConsecutiveGoods: 0,
        newIntervalDays: 80,
      }),
    ).toBe('Mature');
  });
});

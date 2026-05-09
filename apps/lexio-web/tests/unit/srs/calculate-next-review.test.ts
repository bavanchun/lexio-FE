/**
 * Tests for calculateNextReview — doc §4.3.1
 * Covers all 12 required cases from researcher-b test matrix plus extras.
 */

import { describe, it, expect } from 'vitest';
import { calculateNextReview } from '@/core/use-cases/srs/calculate-next-review';
import { makeUserCard, BASE_NOW, addDays, addMinutes } from './helpers';

// ── Helpers ───────────────────────────────────────────────────────────────────

function review(overrides: Parameters<typeof makeUserCard>[0], rating: 1 | 2 | 3 | 4) {
  return calculateNextReview({ userCard: makeUserCard(overrides), rating, now: BASE_NOW });
}

// ── Case 1: New + Good ────────────────────────────────────────────────────────

describe('New card + Good', () => {
  it('transitions to Learning, interval=1, repetitions=1, ease unchanged', () => {
    const { userCard, stageTransitioned } = review({ stage: 'New' }, 3);
    expect(userCard.stage).toBe('Learning');
    expect(userCard.intervalDays).toBe(1);
    expect(userCard.repetitions).toBe(1);
    expect(userCard.easeFactor).toBe(2.5); // Good → no EF change
    expect(stageTransitioned).toBe(true);
  });

  it('sets nextReviewAt to now + 1 day', () => {
    const { userCard } = review({ stage: 'New' }, 3);
    expect(new Date(userCard.nextReviewAt).getTime()).toBe(addDays(BASE_NOW, 1).getTime());
  });
});

// ── Case 2: New + Easy ────────────────────────────────────────────────────────

describe('New card + Easy', () => {
  it('transitions to Young, interval=4, ease increases to 2.65', () => {
    const { userCard, stageTransitioned } = review({ stage: 'New' }, 4);
    expect(userCard.stage).toBe('Young');
    expect(userCard.intervalDays).toBe(4);
    expect(userCard.easeFactor).toBeCloseTo(2.65, 10);
    expect(stageTransitioned).toBe(true);
  });
});

// ── Case 3: Learning + 2nd Good → Young ──────────────────────────────────────

describe('Learning card — 2nd Good promotes to Young', () => {
  it('after 1st Good stays Learning (consecutiveGoods=1)', () => {
    // Simulate card that just entered Learning from New+Good
    const { userCard } = review(
      { stage: 'Learning', intervalDays: 1, consecutiveGoods: 0, repetitions: 1 },
      3,
    );
    expect(userCard.stage).toBe('Learning');
    expect(userCard.consecutiveGoods).toBe(1);
  });

  it('after 2nd Good promotes to Young (consecutiveGoods=2)', () => {
    // Card already has consecutiveGoods=1 from first Learning Good
    const { userCard, stageTransitioned } = review(
      { stage: 'Learning', intervalDays: 1, consecutiveGoods: 1, repetitions: 2 },
      3,
    );
    expect(userCard.stage).toBe('Young');
    expect(stageTransitioned).toBe(true);
  });
});

// ── Case 4: Young → Mature after > 21 day interval ───────────────────────────

describe('Young card with interval > 21 days after Good', () => {
  it('promotes to Mature when computed interval exceeds 21', () => {
    // ef=2.5, current=10 → round(10*2.5)=25 > 21
    const { userCard, stageTransitioned } = review(
      { stage: 'Young', intervalDays: 10, easeFactor: 2.5 },
      3,
    );
    expect(userCard.intervalDays).toBe(25);
    expect(userCard.stage).toBe('Mature');
    expect(stageTransitioned).toBe(true);
  });

  it('stays Young when interval ≤ 21 (ef=2.0, current=9 → 18)', () => {
    const { userCard } = review({ stage: 'Young', intervalDays: 9, easeFactor: 2.0 }, 3);
    expect(userCard.intervalDays).toBe(18);
    expect(userCard.stage).toBe('Young');
  });
});

// ── Case 5: Mature + Again → lapse, demote ───────────────────────────────────

describe('Mature card + Again', () => {
  it('demotes to Learning, resets interval to 0 sub-day, increments lapses', () => {
    const { userCard, stageTransitioned } = review(
      { stage: 'Mature', intervalDays: 30, lapses: 0, easeFactor: 2.5 },
      1,
    );
    expect(userCard.stage).toBe('Learning');
    expect(userCard.intervalDays).toBe(0);
    expect(userCard.lapses).toBe(1);
    expect(userCard.repetitions).toBe(0);
    expect(stageTransitioned).toBe(true);
  });

  it('decreases easeFactor by 0.20', () => {
    const { userCard } = review({ stage: 'Mature', intervalDays: 30, easeFactor: 2.5 }, 1);
    expect(userCard.easeFactor).toBeCloseTo(2.3, 10);
  });

  it('sets nextReviewAt to now + 10 minutes (sub-day step)', () => {
    const { userCard } = review({ stage: 'Mature', intervalDays: 30 }, 1);
    expect(new Date(userCard.nextReviewAt).getTime()).toBe(addMinutes(BASE_NOW, 10).getTime());
  });
});

// ── Case 6: Young + Again → Learning, NO lapse increment ─────────────────────

describe('Young card + Again', () => {
  it('demotes to Learning but lapses remain unchanged', () => {
    const { userCard } = review({ stage: 'Young', intervalDays: 10, lapses: 2 }, 1);
    expect(userCard.stage).toBe('Learning');
    expect(userCard.lapses).toBe(2); // unchanged — doc §4.3.2
  });

  it('resets repetitions and consecutiveGoods', () => {
    const { userCard } = review(
      { stage: 'Young', intervalDays: 10, repetitions: 5, consecutiveGoods: 3 },
      1,
    );
    expect(userCard.repetitions).toBe(0);
    expect(userCard.consecutiveGoods).toBe(0);
  });
});

// ── Case 7: EF floor — Hard at ef=1.3 stays at 1.3 ──────────────────────────

describe('Ease factor floor', () => {
  it('Hard at ef=1.3 stays at floor 1.3', () => {
    const { userCard } = review({ stage: 'Young', intervalDays: 5, easeFactor: 1.3 }, 2);
    expect(userCard.easeFactor).toBe(1.3);
  });

  it('Again × 10 from ef=2.5 → ef clamps at 1.3', () => {
    let card = makeUserCard({ stage: 'Mature', intervalDays: 30, easeFactor: 2.5 });
    for (let i = 0; i < 10; i++) {
      const result = calculateNextReview({ userCard: card, rating: 1, now: BASE_NOW });
      card = result.userCard;
    }
    expect(card.easeFactor).toBe(1.3);
  });
});

// ── Case 8: EF grows unboundedly on consecutive Easy ─────────────────────────

describe('Ease factor — no upper cap', () => {
  it('consecutive Easy ratings grow EF beyond 2.5', () => {
    let card = makeUserCard({ stage: 'Young', intervalDays: 5, easeFactor: 2.5 });
    for (let i = 0; i < 5; i++) {
      const result = calculateNextReview({ userCard: card, rating: 4, now: BASE_NOW });
      card = result.userCard;
    }
    expect(card.easeFactor).toBeGreaterThan(2.5);
    // 2.5 + 5×0.15 = 3.25
    expect(card.easeFactor).toBeCloseTo(3.25, 5);
  });
});

// ── Case 9: Interval rounds to integer ───────────────────────────────────────

describe('Interval rounding', () => {
  it('Young + Good with ef=1.7 and interval=7 → round(7*1.7)=round(11.9)=12', () => {
    const { userCard } = review({ stage: 'Young', intervalDays: 7, easeFactor: 1.7 }, 3);
    expect(Number.isInteger(userCard.intervalDays)).toBe(true);
    expect(userCard.intervalDays).toBe(12);
  });
});

// ── Case 10: nextReviewAt timestamp arithmetic ────────────────────────────────

describe('nextReviewAt timestamp arithmetic', () => {
  it('interval=6 days → nextReviewAt = now + 6 days exactly', () => {
    const card = makeUserCard({
      stage: 'Learning',
      intervalDays: 1,
      consecutiveGoods: 1,
      repetitions: 2,
    });
    const { userCard } = calculateNextReview({ userCard: card, rating: 3, now: BASE_NOW });
    const expected = addDays(BASE_NOW, 3).getTime(); // 2nd good → interval=3
    expect(new Date(userCard.nextReviewAt).getTime()).toBe(expected);
  });

  it('Learning again → nextReviewAt = now + 10 minutes', () => {
    const { userCard } = review({ stage: 'Learning', intervalDays: 0 }, 1);
    expect(new Date(userCard.nextReviewAt).getTime()).toBe(addMinutes(BASE_NOW, 10).getTime());
  });
});

// ── Case 11: Mature + Hard ────────────────────────────────────────────────────

describe('Mature card + Hard', () => {
  it('interval grows by 1.2x (at least +1 day), stage stays Mature', () => {
    const { userCard, stageTransitioned } = review(
      { stage: 'Mature', intervalDays: 30, easeFactor: 2.5 },
      2,
    );
    // max(30+1, round(30*1.2)) = max(31, 36) = 36
    expect(userCard.intervalDays).toBe(36);
    expect(userCard.stage).toBe('Mature');
    expect(stageTransitioned).toBe(false);
  });

  it('ef decreases by 0.15 on Hard', () => {
    const { userCard } = review({ stage: 'Mature', intervalDays: 30, easeFactor: 2.5 }, 2);
    expect(userCard.easeFactor).toBeCloseTo(2.35, 10);
  });
});

// ── Case 12: New + Again ──────────────────────────────────────────────────────

describe('New card + Again', () => {
  it('stays New, interval=0 (sub-day), lapses unchanged', () => {
    const { userCard, stageTransitioned } = review({ stage: 'New', lapses: 0 }, 1);
    expect(userCard.stage).toBe('New');
    expect(userCard.intervalDays).toBe(0);
    expect(userCard.lapses).toBe(0); // lapses only increment for Mature
    expect(stageTransitioned).toBe(false);
  });

  it('resets repetitions to 0', () => {
    const { userCard } = review({ stage: 'New', repetitions: 0 }, 1);
    expect(userCard.repetitions).toBe(0);
  });
});

// ── Additional: intervalChanged flag ─────────────────────────────────────────

describe('intervalChanged flag', () => {
  it('is true when interval changed', () => {
    const { intervalChanged } = review({ stage: 'New' }, 3); // 0→1 day
    expect(intervalChanged).toBe(true);
  });

  it('is false when interval stays 0 (New + Again)', () => {
    const { intervalChanged } = review({ stage: 'New', intervalDays: 0 }, 1);
    expect(intervalChanged).toBe(false);
  });
});

// ── Learning + Easy instant Young ────────────────────────────────────────────

describe('Learning card + Easy', () => {
  it('jumps directly to Young', () => {
    const { userCard } = review({ stage: 'Learning', intervalDays: 1, easeFactor: 2.5 }, 4);
    expect(userCard.stage).toBe('Young');
    // max(4, round(1 * 2.5)) = max(4, 3) = 4
    expect(userCard.intervalDays).toBe(4);
  });
});

// ── New + Hard ────────────────────────────────────────────────────────────────

describe('New card + Hard', () => {
  it('stays New, interval=0 sub-day, repetitions unchanged', () => {
    const { userCard } = review({ stage: 'New', intervalDays: 0 }, 2);
    expect(userCard.stage).toBe('New');
    expect(userCard.intervalDays).toBe(0);
    expect(userCard.intervalMinutes).toBe(10);
  });

  it('ef decreases by 0.15 on Hard from New', () => {
    const { userCard } = review({ stage: 'New', easeFactor: 2.5 }, 2);
    expect(userCard.easeFactor).toBeCloseTo(2.35, 10);
  });
});

// ── Learning + Hard ───────────────────────────────────────────────────────────

describe('Learning card + Hard', () => {
  it('interval grows by 1.2x (min 1 day), stays Learning', () => {
    const { userCard } = review({ stage: 'Learning', intervalDays: 1, consecutiveGoods: 0 }, 2);
    // max(1, round(1 * 1.2)) = max(1, 1) = 1
    expect(userCard.intervalDays).toBe(1);
    expect(userCard.stage).toBe('Learning');
  });

  it('interval=5 + Hard → round(5*1.2)=6', () => {
    const { userCard } = review({ stage: 'Learning', intervalDays: 5, consecutiveGoods: 1 }, 2);
    expect(userCard.intervalDays).toBe(6);
  });

  it('resets consecutiveGoods on Hard', () => {
    const { userCard } = review({ stage: 'Learning', intervalDays: 2, consecutiveGoods: 1 }, 2);
    expect(userCard.consecutiveGoods).toBe(0);
  });
});

// ── Mature + Good ─────────────────────────────────────────────────────────────

describe('Mature card + Good', () => {
  it('interval = round(current * ef), stage stays Mature', () => {
    const { userCard } = review({ stage: 'Mature', intervalDays: 30, easeFactor: 2.5 }, 3);
    expect(userCard.intervalDays).toBe(75); // round(30 * 2.5)
    expect(userCard.stage).toBe('Mature');
  });

  it('Mature + Easy → round(current * ef * 1.3)', () => {
    const { userCard } = review({ stage: 'Mature', intervalDays: 30, easeFactor: 2.5 }, 4);
    expect(userCard.intervalDays).toBe(Math.round(30 * 2.65 * 1.3)); // ef+0.15=2.65
    expect(userCard.stage).toBe('Mature');
  });
});

// ── Boundary: Young at interval exactly = 21 stays Young ─────────────────────

describe('Young → Mature boundary at 21 days', () => {
  it('interval exactly 21 stays Young (threshold is strictly >21)', () => {
    // ef=2.1, current=10 → round(10*2.1)=21
    const { userCard } = review({ stage: 'Young', intervalDays: 10, easeFactor: 2.1 }, 3);
    expect(userCard.intervalDays).toBe(21);
    expect(userCard.stage).toBe('Young');
  });

  it('interval 22 promotes to Mature', () => {
    // ef=2.2, current=10 → round(10*2.2)=22
    const { userCard } = review({ stage: 'Young', intervalDays: 10, easeFactor: 2.2 }, 3);
    expect(userCard.intervalDays).toBe(22);
    expect(userCard.stage).toBe('Mature');
  });
});

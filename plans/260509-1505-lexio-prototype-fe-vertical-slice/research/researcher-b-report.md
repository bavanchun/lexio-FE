# Researcher B — SM-2 algorithm + Anki-compatible edge cases

## Scope

Canonical SM-2 formulas, ease floor, interval rounding, lapse handling, 4-stage transitions, adaptive throttling.

## SM-2 canonical formulas (Piotr Wozniak, 1987)

Inputs per review: `q` = quality of recall (0-5 in classic SM-2; Anki/Lexio uses 1-4 mapped buttons).

Lexio rating mapping (doc §4.3):

- Again = 1 (q≈0..2 — failure)
- Hard = 2 (q≈3)
- Good = 3 (q≈4)
- Easy = 4 (q≈5)

### Ease factor update (doc §4.3.1)

Doc specifies:

- Again: ef -= 0.20
- Hard: ef -= 0.15
- Good: ef unchanged
- Easy: ef += 0.15

Floor: `ef = max(1.3, ef)`. No upper cap (typical Anki uses 2.5+ unbounded).

### Interval calculation (per stage)

Lexio uses 4 stages: New, Learning, Young, Mature. Anki-style sub-day learning steps for `New`/`Learning`, then graduated to days.

Recommended interval rules for Lexio prototype (KISS):

- **New** card, first rating:
  - Again: stay New, next review = +1min (or skip — for prototype, session-end re-queue)
  - Hard: stay New/Learning, +10min
  - Good: → Learning, interval = 1 day, repetitions = 1
  - Easy: → Young, interval = 4 days, repetitions = 1 (graduating skip)
- **Learning** (interval < 1 day or 1 day step):
  - Again: stay Learning, interval = +10min, repetitions = 0, lapses unchanged
  - Hard: interval \*= 1.2 (min 1d), stay Learning
  - Good: 2 consecutive Goods → Young; first Good interval = 1d, second Good interval = 3d → Young
  - Easy: jump to Young, interval = max(4, current \* 2.5)
- **Young** (1-21 days):
  - Again: → Learning, interval = 10min, lapses++ (NOTE: doc §4.3.2 says lapses only count when leaving Mature; we follow doc — lapses unchanged in Young, just demote)
  - Hard: interval = max(1, round(current \* 1.2))
  - Good: interval = round(current \* ef)
  - Easy: interval = round(current _ ef _ 1.3)
  - If new interval > 21 → stage = Mature
- **Mature** (>21 days):
  - Again: → Learning, interval = 10min, **lapses++**, ef -= 0.20 (per doc)
  - Hard: interval = max(current+1, round(current \* 1.2))
  - Good: interval = round(current \* ef)
  - Easy: interval = round(current _ ef _ 1.3)

### Repetitions counter

Increment on Hard/Good/Easy. Reset to 0 on Again.

### Lapses counter (doc §4.3.1)

"Times card was rated Again after Mature stage" — increment ONLY when current stage == Mature and rating == Again.

### Interval rounding & jitter

- Round intervals ≥ 1 day to whole days (Math.round).
- Apply ±5% fuzz for intervals > 4 days to avoid review pile-ups (Anki convention; OPTIONAL for prototype — KISS skip).

### Cap

Max interval = 365 days (doc §4.3.1 "0 - 365+" implies cap optional). Use 36500 (~100 years) as safety upper bound, no real cap.

## 4-stage transitions (per doc §4.3.2)

| From     | Trigger                  | To       |
| -------- | ------------------------ | -------- |
| New      | First Good or Easy       | Learning |
| Learning | 2 consecutive Goods      | Young    |
| Learning | Easy from New transition | Young    |
| Young    | interval > 21 days       | Mature   |
| Mature   | Again                    | Learning |

Implementation: track `consecutiveGoodsInLearning` field on UserCard (or derive from repetitions when stage=Learning).

## Adaptive new-card cap (doc §4.3.3)

```
let newLimit = userTarget; // default 15-20
if (dueToday > 100) newLimit = Math.max(5, userTarget * 0.5);
if (dueToday > 200) newLimit = 0;
if (retention7d < 0.80) newLimit = Math.floor(userTarget * 0.7);
return Math.min(newLimit, availableNewCards);
```

Computed at session-start in `core/use-cases/srs/get-session-queue.ts`.

## Pure TS structure

```ts
// core/use-cases/srs/calculate-next-review.ts
export type Rating = 1 | 2 | 3 | 4;
export type Stage = 'New' | 'Learning' | 'Young' | 'Mature';

export interface UserCardState {
  stage: Stage;
  easeFactor: number;
  intervalDays: number; // 0 for sub-day
  intervalMinutes?: number; // for Learning sub-day intervals
  repetitions: number;
  lapses: number;
  consecutiveGoods: number;
}

export interface ReviewInput {
  state: UserCardState;
  rating: Rating;
  now: Date;
}

export interface ReviewOutput {
  state: UserCardState;
  nextReviewAt: Date;
}

export function calculateNextReview(input: ReviewInput): ReviewOutput {
  /* ... */
}
```

Pure function. Zero React/framework imports. Test ≥95% branch coverage.

## Test matrix (Vitest)

1. New + Good → Learning, interval=1d, ef=2.5
2. New + Easy → Young, interval=4d
3. Learning + Good twice → Young
4. Young + Again → Learning, lapses unchanged (per doc)
5. Mature + Again → Learning, lapses++, ef-=0.2
6. EF floor: rate Again 10x → ef stays at 1.3
7. EF on Easy: 2.5 + 0.15 = 2.65, capped/uncapped (uncapped)
8. Interval Young + Good: ef=2.5, current=10 → 25 days → Mature
9. Adaptive cap: dueToday=150 → newLimit = max(5, target\*0.5)
10. Adaptive cap: dueToday=250 → newLimit = 0
11. Retention 75% → newLimit = target\*0.7
12. nextReviewAt for Learning uses `now + intervalMinutes * 60000`

## References

- SuperMemo SM-2 original: supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
- Anki manual SRS section: docs.ankiweb.net/deck-options.html
- "FSRS" is newer (2024) — explicitly NOT chosen by doc; stick with SM-2.

## Open questions

- Should EF be capped (e.g., max 3.0)? Doc says "1.3 – 2.5+" — uncapped. KEEP uncapped.
- Should we apply ±5% fuzz on intervals? KISS: skip in prototype.
- New card "Again" handling: doc unclear. Decision: stay New, re-queue at session end (no DB interval update beyond keeping next_review_at = now).

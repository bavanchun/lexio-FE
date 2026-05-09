# Phase 04 — SRS engine (pure TS)

## Context links

- Doc §4.3 (study session flow), §4.3.1 (SM-2 params), §4.3.2 (stage transitions), §4.3.3 (adaptive cap)
- Research: researcher-b-report.md (canonical SM-2 formulas, edge cases)
- Depends on: phase-03 (entities, ports)
- Unblocks: phase-08 (study session uses these use-cases)

## Overview

- **Priority:** P1 (heart of the product)
- **Status:** pending
- **Brief:** Implement SM-2 + 4-stage transition + adaptive new-card cap as PURE TYPESCRIPT in `core/use-cases/srs/`. Zero React, zero browser APIs, zero Dexie. Exhaustive Vitest coverage ≥95% branches.

## Key insights

- Lapses increment ONLY when leaving Mature on Again (doc §4.3.2 explicit).
- EF floor 1.3, no upper cap.
- Stage promotion Learning→Young requires 2 consecutive Goods (track via `consecutiveGoods`).
- New + Easy short-circuits to Young with interval=4 days (graduating skip).
- Adaptive cap algorithm exact per doc §4.3.3.
- All time math via injected `now: Date` to make tests deterministic.

## Requirements

**Functional:**

- `calculateNextReview({ state, rating, now })` returns new state + nextReviewAt.
- `getSessionQueue({ dueCards, newCards, dueTodayCount, retention7d, target })` returns ordered list of cards to study, applying adaptive cap.
- `computeXp({ rating, isFirstReview })` returns XP per doc §4.4.2 (New=10, Again=2, Hard=4, Good=8, Easy=12).
- `updateStreakOnReview({ streak, now })` increments if first review of new day, breaks if gap ≥2 days, no-op if already active today.
- `checkAchievements({ user, streak, masteredCount, sessionStats })` returns array of newly-earned badge codes per doc §4.4.4.

**NFR:** ≥95% branch coverage on `core/use-cases/srs/`. Pure functions — no side effects.

## Architecture

```
core/use-cases/
├── srs/
│   ├── calculate-next-review.ts
│   ├── stage-transitions.ts
│   ├── interval-calculator.ts
│   ├── ease-factor.ts
│   ├── get-session-queue.ts
│   └── index.ts
└── gamification/
    ├── compute-xp.ts
    ├── update-streak.ts
    ├── check-achievements.ts
    └── index.ts
```

Data flow:

```
UI rates card ─► review-card use case (phase 08) ─► calculate-next-review (pure)
                                                  └─► compute-xp (pure)
                                                  └─► update-streak (pure)
                                                  └─► check-achievements (pure)
                                                  ─► persist via repos (phase 05)
```

## Related code files

**Create:**

- `apps/lexio-web/core/use-cases/srs/calculate-next-review.ts`
- `apps/lexio-web/core/use-cases/srs/stage-transitions.ts`
- `apps/lexio-web/core/use-cases/srs/interval-calculator.ts`
- `apps/lexio-web/core/use-cases/srs/ease-factor.ts`
- `apps/lexio-web/core/use-cases/srs/get-session-queue.ts`
- `apps/lexio-web/core/use-cases/srs/index.ts`
- `apps/lexio-web/core/use-cases/gamification/{compute-xp,update-streak,check-achievements,index}.ts`
- Tests:
- `apps/lexio-web/tests/unit/srs/calculate-next-review.test.ts`
- `apps/lexio-web/tests/unit/srs/stage-transitions.test.ts`
- `apps/lexio-web/tests/unit/srs/get-session-queue.test.ts`
- `apps/lexio-web/tests/unit/gamification/compute-xp.test.ts`
- `apps/lexio-web/tests/unit/gamification/update-streak.test.ts`
- `apps/lexio-web/tests/unit/gamification/check-achievements.test.ts`

## Implementation steps

1. `ease-factor.ts`: `applyEaseFactor(currentEf, rating)` — Again -=0.20, Hard -=0.15, Good 0, Easy +=0.15. Floor 1.3.
2. `interval-calculator.ts`: stage-aware. Handles New/Learning/Young/Mature per researcher-b matrix. Output `{ intervalDays, intervalMinutes? }`.
3. `stage-transitions.ts`: `transitionStage(currentStage, rating, repetitions, consecutiveGoods, newIntervalDays)` returns new stage. Apply doc §4.3.2 rules.
4. `calculate-next-review.ts`: orchestrates the three above. Returns `{ state, nextReviewAt }` where nextReviewAt = now + (intervalDays || intervalMinutes/1440)\*86400000.
5. `get-session-queue.ts`:
   ```ts
   export function getSessionQueue({ dueCards, newCards, dueTodayCount, retention7d, target }): {
     dueQueue: UserCard[];
     newQueue: UserCard[];
     appliedNewLimit: number;
   } {
     let limit = target;
     if (dueTodayCount > 100) limit = Math.max(5, Math.floor(target * 0.5));
     if (dueTodayCount > 200) limit = 0;
     if (retention7d < 0.8) limit = Math.floor(target * 0.7);
     limit = Math.min(limit, newCards.length);
     return { dueQueue: dueCards, newQueue: newCards.slice(0, limit), appliedNewLimit: limit };
   }
   ```
6. `compute-xp.ts`: rating → xp map. Bonus +50 if `isDailyGoalReached`.
7. `update-streak.ts`: pure. Compares `lastActiveDate` (Date in user TZ) to `now`. Day diff 0 → no change; 1 → ++current, ++longest; ≥2 → reset to 1.
8. `check-achievements.ts`: pure. Returns badge codes for First Steps, Week Warrior, Month Master, Century Club, Kilo Crusher, Polyglot Path (5 decks created — out of scope for prototype but stub it), Speed Demon, Perfect Day, Comeback Kid.
9. **Tests** — at minimum the 12 cases listed in researcher-b §"Test matrix", plus:
   - All EF floor cases
   - All stage transitions table-driven
   - Adaptive cap: dueToday=99, 100, 101, 200, 201, retention=0.79, 0.80
   - Streak: midnight boundary, DST shift, ≥2-day gap
   - XP: each rating, with and without daily goal bonus
   - Achievements: trigger conditions exact, no false positives
10. Run `pnpm vitest --coverage`. Verify branches ≥95% on `core/use-cases/srs/`.

## Todo

- [ ] `ease-factor.ts` + tests
- [ ] `interval-calculator.ts` + tests
- [ ] `stage-transitions.ts` + tests
- [ ] `calculate-next-review.ts` + tests (12+ cases)
- [ ] `get-session-queue.ts` + tests (adaptive cap matrix)
- [ ] `compute-xp.ts` + tests
- [ ] `update-streak.ts` + tests (DST safe)
- [ ] `check-achievements.ts` + tests
- [ ] Coverage ≥95% branches on srs/
- [ ] Coverage ≥80% on gamification/

## Success criteria

- `pnpm vitest --coverage` reports ≥95% branches in `core/use-cases/srs/`.
- All test cases from researcher-b matrix pass.
- No imports from React/DOM/lib in core/use-cases.

## Risk assessment

| Risk                                       | Likelihood | Impact | Mitigation                                                                                                |
| ------------------------------------------ | ---------- | ------ | --------------------------------------------------------------------------------------------------------- |
| Off-by-one in interval rounding            | M          | H      | Property-based tests using `fast-check` (optional); explicit test cases at boundary (21 day Young→Mature) |
| Streak DST bugs                            | M          | M      | Use date-fns `differenceInCalendarDays` with explicit timezone; tests across DST transition dates         |
| Stage transition logic divergence from doc | M          | H      | Table-driven test mirroring §4.3.2 exactly; doc-quoted comments in code                                   |

## Security considerations

- N/A (pure logic). No user input directly here — schemas validate at boundaries.

## Next steps

Phase 08 (study session) imports these use-cases.

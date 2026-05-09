# Phase 04 Report — SRS Engine Pure TS

**Date:** 2026-05-10
**Branch:** feat/web-srs-engine
**PR:** https://github.com/bavanchun/lexio-FE/pull/2 (base: feat/web-clean-arch-skeleton)
**Status:** DONE

---

## File Tree

```
apps/lexio-web/
├── core/use-cases/
│   ├── srs/
│   │   ├── ease-factor.ts           (35 LOC)
│   │   ├── interval-calculator.ts   (166 LOC after prettier)
│   │   ├── stage-transitions.ts     (82 LOC)
│   │   ├── calculate-next-review.ts (115 LOC)
│   │   ├── get-session-queue.ts     (72 LOC)
│   │   └── index.ts                 (barrel)
│   └── gamification/
│       ├── compute-xp.ts            (48 LOC)
│       ├── compute-level.ts         (40 LOC)
│       ├── update-streak.ts         (68 LOC)
│       ├── check-achievements.ts    (76 LOC)
│       └── index.ts                 (barrel)
├── tests/unit/
│   ├── srs/
│   │   ├── helpers.ts
│   │   ├── calculate-next-review.test.ts   (34 tests)
│   │   ├── stage-transitions.test.ts        (20 tests)
│   │   └── get-session-queue.test.ts        (17 tests)
│   └── gamification/
│       ├── compute-xp.test.ts       (9 tests)
│       ├── compute-level.test.ts    (17 tests)
│       ├── update-streak.test.ts    (14 tests)
│       └── check-achievements.test.ts (27 tests + 1 new-user test = 27 tests)
├── vitest.config.ts                 (coverage config added)
└── package.json                     (coverage, coverage:srs scripts added)
```

## Coverage Output

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
All files          |     100 |      100 |     100 |    100
 gamification      |     100 |      100 |     100 |    100
  check-achievements.ts | 100 | 100 | 100 | 100
  compute-level.ts      | 100 | 100 | 100 | 100
  compute-xp.ts         | 100 | 100 | 100 | 100
  update-streak.ts      | 100 | 100 | 100 | 100
 srs               |     100 |      100 |     100 |    100
  calculate-next-review.ts | 100 | 100 | 100 | 100
  ease-factor.ts         | 100 | 100 | 100 | 100
  get-session-queue.ts   | 100 | 100 | 100 | 100
  interval-calculator.ts | 100 | 100 | 100 | 100
  stage-transitions.ts   | 100 | 100 | 100 | 100
```

## Test Count

- Total: **143 tests** across 8 test files (7 unit + 1 architecture boundaries)
- SRS unit: 71 tests (34 calculate-next-review + 20 stage-transitions + 17 get-session-queue)
- Gamification unit: 67 tests
- Architecture boundaries: 5 tests (all passing — SRS code has zero framework imports confirmed)

## Build Status

- `pnpm typecheck`: PASS
- `pnpm lint`: PASS (0 errors, 0 warnings after eslint-disable on intentional unused params)
- `pnpm test`: PASS (143/143)
- `pnpm coverage`: PASS (100% all metrics, thresholds 95% met)
- `pnpm build`: PASS (Next.js static build clean)

## Key Decisions / Deviations

1. **Adaptive cap boundary clarification:** `dueTodayCount > 200` uses strict greater-than, so 200 itself falls through to the 100-rule (which gives `max(5, floor(target*0.5))`). Spec was "0 - 365+" which implies strict. Tests validate boundary explicitly.

2. **New+Easy graduates to Young (not Learning):** researcher-b recommends "graduating skip" — New+Easy → Young with interval=4. Implemented and tested as case 2.

3. **Lapse increment only on Mature+Again:** Implemented strictly per doc §4.3.2. Young+Again demotes to Learning without incrementing lapses. All 6 relevant test cases verify this.

4. **`@vitest/coverage-v8` pinned to `^3.2.3`:** Installed to match `vitest@3.2.4` peer. Initial install brought in v4.1.5 (peer mismatch); corrected.

5. **`coverage/` added to eslint globalIgnores:** Vitest generates `coverage/block-navigation.js` which triggered a spurious eslint warning on the first run.

6. **Gamification compute-level.ts:** `xpRequiredForLevel(n) = floor(100 * (n-1)^1.5)` — level 1 returns 0. `levelFromTotalXp` iterates upward until threshold exceeded. Both functions fully covered.

## Framework Import Verification

```
grep -rE "from 'react'|from 'next'|from 'dexie'|from 'zustand'" apps/lexio-web/core/use-cases/
→ No violations — clean
```

## PR URL

https://github.com/bavanchun/lexio-FE/pull/2

## Unresolved Questions

None.

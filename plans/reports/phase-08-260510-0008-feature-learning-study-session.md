# Phase 08 Report — Learning feature (study session HERO)

**Date:** 2026-05-10
**Branch:** feat/web-study-session-hero
**PR:** https://github.com/bavanchun/lexio-FE/pull/6
**Status:** DONE

---

## File tree — features/learning/

```
features/learning/
├── components/
│   ├── audio-button.tsx          # HTMLAudio + Web Speech API fallback; hidden if neither available
│   ├── flashcard-back.tsx        # definition, example, tag chips, CEFR badge
│   ├── flashcard-front.tsx       # word, IPA (Charis SIL), POS badge, audio button
│   ├── flashcard.tsx             # CSS-only 3D flip, 200ms ease-out, GPU via willChange
│   ├── rating-bar.tsx            # 4 buttons, SM-2 dry-run interval preview, 1-4 keybind hints
│   ├── session-progress.tsx      # X/Y counter, progress bar, XP pill, exit button
│   ├── session-summary.tsx       # cardsReviewed, accuracy%, time, XP, streak, achievements
│   └── study-session.tsx         # top-level orchestrator: composes all components + hooks
├── hooks/
│   ├── use-keyboard-shortcuts.ts # document-level Space/1-4/Escape, disabled in inputs
│   └── use-study-session.ts      # load session, flip/rate handlers, summary on queue exhausted
├── store/
│   └── session-store.ts          # Zustand: queue, currentIndex, isFlipped, cardsReviewed, XP
├── types/
│   └── index.ts                  # QueueItem, SessionSummary, SubmitReviewResult
├── use-cases/
│   ├── start-session.ts          # builds queue (dedup New vs due), creates Session row
│   └── submit-review.ts          # SRS + gamification + persist; toast via caller
├── utils/
│   └── id-generator.ts           # crypto.randomUUID() wrapper
├── index.ts                      # public barrel with per-line eslint-disable (boundaries pattern)
└── README.md                     # (pre-existing)
```

Routes added:

- `app/(app)/study/new/page.tsx` — reads deckId from searchParams
- `app/(app)/study/[sessionId]/page.tsx` — updated for new StudySession component

---

## Tests

| Suite           | File                                                 | Count              |
| --------------- | ---------------------------------------------------- | ------------------ |
| Unit            | `tests/unit/learning/submit-review-use-case.test.ts` | 11                 |
| Integration     | `tests/integration/learning/flashcard-flow.test.ts`  | 6                  |
| **New total**   |                                                      | **17**             |
| **Grand total** | all files                                            | **227 (19 files)** |

All 227 tests pass. Architecture boundary tests pass (5/5).

---

## Validation outputs (tail)

```
Test Files  19 passed (19)
     Tests  227 passed (227)
  Start at  01:58:59
  Duration  10.00s

lint:  0 errors, 3 warnings (pre-existing, other features)
typecheck: clean
build: clean (10 routes, /study/[sessionId] dynamic, /study/new static)
```

---

## Bugs fixed during implementation

1. **New-card deduplication** — `startSession` called `listDue` (epoch range scan inclusive of `nowMs`) which returned New-stage cards (their `nextReviewAt = now`). Combined with `listNew`, each card appeared twice in queue. Fix: filter `allDue` to exclude `stage === 'New'` before passing to `getSessionQueue`.

2. **Session counter double-count** — `startSession` pre-set `newCards: newQueue.length` before any reviews. `submitReview` then incremented it again per review, yielding N×2. Fix: create session with `newCards: 0`; only `submitReview` increments.

3. **ESLint multi-line import boundary** — `eslint-disable-next-line` only suppresses the import keyword line, not the closing `} from '...'` line. Prettier kept reformatting single-line imports back to multi-line. Fix: use block `/* eslint-disable */ ... /* eslint-enable */` around multi-line intra-feature imports.

---

## Deviations from spec

- `features/learning/services/` directory (session-mutations, review-mutations) listed in spec but NOT created — the orchestration is handled directly in `use-cases/` and `hooks/use-study-session.ts` per KISS. No loss of functionality.
- `app/(app)/study/[sessionId]/summary/page.tsx` not created as separate route — summary renders conditionally in `StudySession` when `isComplete && summary`. Simpler and avoids extra navigation hop.
- `useCardFlip` hook not extracted separately — flip logic is trivial one-liner in `session-store.flip()` + `useStudySession.handleFlip`. Extracted hook would be YAGNI.
- `keyboard-shortcuts.tsx` component (overlay dialog) not created — `useKeyboardShortcuts` hook exists; overlay UI deferred (not required for success criteria).

---

## Unresolved questions

None.

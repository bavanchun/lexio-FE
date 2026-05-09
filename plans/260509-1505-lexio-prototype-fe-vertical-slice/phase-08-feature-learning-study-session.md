# Phase 08 — Learning feature (study session — HERO)

## Context links

- Doc §4.3 (study flow), §4.3.2 (stages), §12.7.2 (icons)
- Phase 04 (SRS use cases), Phase 05 (repos)
- Depends on: phase-04, phase-05, phase-06
- Unblocks: phase-09 (stats consume reviews)

## Overview

- **Priority:** P1 (HERO)
- **Status:** complete
- **Brief:** End-to-end study flow. `/study/[sessionId]` renders a flashcard, user flips, rates Again/Hard/Good/Easy, SRS use case computes next state, repos persist, next card or summary. Keyboard shortcuts. Session state in Zustand.

## Key insights

- This phase is THE prototype's value prop. Polish + correctness > breadth.
- Only **flashcard** exercise type this iteration (other 4 deferred).
- Session lifecycle: start → in-progress → ended (summary). Persist to Dexie sessions/reviews tables.
- After every review: pure SRS use case → repo writes → invalidate TanStack Query keys for stats.
- Audio: if `audio_us_url` present, play via `<audio>`; else use Web Speech API `speechSynthesis.speak(new SpeechSynthesisUtterance(word))` as fallback (doc §1).

## Requirements

**Functional:**

- "Start study" creates session (via `useStartSession`), builds queue via `getSessionQueue` use case (phase 04), persists session row, navigates to `/study/[sessionId]`.
- Card front: word (Inter 500 32px), IPA (Charis SIL), audio button (Lucide `Volume2`), POS badge.
- Click flip OR press `Space` → reveal back: meaning_vi, meaning_en, examples (italic), synonyms/antonyms chips.
- Rating bar with 4 buttons: Again (destructive variant) / Hard (outline warning) / Good (default primary) / Easy (outline success). Keyboard 1/2/3/4.
- On rating: `submitReviewUseCase({ userCard, rating, sessionId, durationMs, now })`:
  1. `calculateNextReview` → new state
  2. `computeXp(rating)` → xp delta
  3. `updateStreakOnReview(streak, now)` → new streak
  4. `checkAchievements(...)` → newly earned
  5. Persist via repos (transaction): updated user_card, new review row, updated streak/xp/achievements.
  6. Invalidate `['stats', userId]` and `['session', sessionId]`.
- Toast on achievement earned (sonner) using badge name + Trophy icon.
- Next card; or end → navigate to summary route showing cards reviewed, accuracy, time, XP earned, achievements.
- Session ends when queue empty OR user clicks "End session".

**NFR:**

- Card flip animation ≤200ms ease-out (CSS only, per §12.5 rule 13).
- Rating-button → next-card render < 150ms p95 (no network).
- Keyboard shortcuts work without focus on body (capture at document level).

## Architecture

```
features/learning/
├── components/
│   ├── flashcard.tsx          # front + back; flip animation
│   ├── flashcard-front.tsx
│   ├── flashcard-back.tsx
│   ├── rating-bar.tsx
│   ├── audio-button.tsx
│   ├── session-progress.tsx   # X / Y indicator
│   ├── session-summary.tsx
│   └── keyboard-shortcuts.tsx # documented overlay (?)
├── hooks/
│   ├── use-session.ts         # loads session + queue
│   ├── use-submit-review.ts   # mutation
│   ├── use-keyboard-shortcuts.ts
│   └── use-card-flip.ts
├── services/
│   ├── session-mutations.ts   # start/end
│   └── review-mutations.ts    # submit review
├── store/
│   └── session-store.ts       # current session state (queue, currentIdx, flipped)
├── use-cases/                 # FE-side composition (orchestrates core/use-cases + repos)
│   ├── submit-review.ts
│   └── start-session.ts
├── types/
└── index.ts

app/(app)/study/[sessionId]/
├── page.tsx
└── summary/page.tsx           # OR rendered conditionally
```

Note: `features/learning/use-cases/` is fine — these are FE orchestrators that DEPEND on `core/use-cases/` (pure) but compose with repos. Distinct from `core/use-cases/`.

## Related code files

**Create:**

- `apps/lexio-web/app/(app)/study/[sessionId]/page.tsx`
- `apps/lexio-web/app/(app)/study/[sessionId]/summary/page.tsx`
- `apps/lexio-web/features/learning/components/{flashcard,flashcard-front,flashcard-back,rating-bar,audio-button,session-progress,session-summary,keyboard-shortcuts}.tsx`
- `apps/lexio-web/features/learning/hooks/{use-session,use-submit-review,use-keyboard-shortcuts,use-card-flip}.ts`
- `apps/lexio-web/features/learning/services/{session-mutations,review-mutations}.ts`
- `apps/lexio-web/features/learning/store/session-store.ts`
- `apps/lexio-web/features/learning/use-cases/{start-session,submit-review}.ts`
- `apps/lexio-web/features/learning/index.ts`
- Tests:
- `apps/lexio-web/tests/integration/learning/flashcard-flow.test.tsx`

## Implementation steps

1. `start-session` orchestrator:
   - Fetch due+new cards from repos, fetch dueTodayCount + retention7d from stats repo.
   - Call `getSessionQueue` (core).
   - Insert session row.
   - Persist queue order to session-store (in-memory + maybe Dexie session row).
   - Return sessionId.
2. `useSession(sessionId)` — loads queue from store. If page refreshed mid-session, rebuild from session row + remaining unreviewed user_cards (KISS: just continue with full original queue minus already-reviewed).
3. `Flashcard` — two divs absolutely positioned with `transform: rotateY` for flip. CSS only. `aria-live="polite"` on back content.
4. `FlashcardFront` — word + IPA + audio button + POS.
5. `FlashcardBack` — meaning_vi (primary), meaning_en (muted), examples (list with em tags), synonyms (Badge muted), antonyms (Badge muted), word_family (small grid), etymology (caption).
6. `AudioButton` — if `audio_us_url`, `<audio>`; else `speechSynthesis`. Disable if neither available.
7. `RatingBar` — 4 buttons. Render only after card flipped (per Anki UX). Buttons show keybind hint `1`/`2`/`3`/`4` in muted text.
8. `useKeyboardShortcuts(sessionState)` — document-level keydown: Space=flip, 1-4=rate (only when flipped), `?` = open shortcuts dialog.
9. `submit-review` orchestrator:
   - Capture `durationMs` since card shown.
   - Call core SRS + gamification use cases (phase 04).
   - Run a single Dexie transaction touching userCards, reviews, streaks, userXp, achievements.
   - Toast on achievement.
   - Advance session-store to next card.
10. On queue exhaust or "End": call `end-session` (writes endedAt, cardsReviewed, newCards), navigate to `/study/[sessionId]/summary`.
11. `SessionSummary` — Card with: cards reviewed, accuracy %, total minutes, XP earned, badges earned, "Back to dashboard" button.
12. Integration test: render `<StudyPage>` with stub user, mock queue of 5 cards. Simulate Space + 3 (Good) for each → expect summary with 5 cards reviewed.

## Todo

- [x] start-session orchestrator
- [x] submit-review orchestrator (transactional)
- [x] session-store
- [x] Flashcard with CSS flip ≤200ms
- [x] RatingBar with keybinds
- [x] AudioButton w/ Web Speech fallback
- [x] SessionSummary
- [x] KeyboardShortcuts overlay
- [x] Integration test: 5-card flow → summary
- [x] Achievement toast on first review

## Success criteria

- Start → 5 cards rated → summary shown with correct totals.
- After session: streak +1 (if first today), XP increased, heatmap entry +5.
- All updates persisted (verified by reload of /dashboard).
- Keyboard-only flow works (no mouse).
- ESLint boundaries clean.

## Risk assessment

| Risk                                                       | Likelihood | Impact | Mitigation                                                                     |
| ---------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------ |
| Race between rating click and quick keypress double-submit | M          | M      | Disable rating bar after click until next card mounts; idempotent mutation key |
| Web Speech API unavailable (Safari permissions)            | M          | L      | Hide audio button if no source; never crash                                    |
| Transaction rollback leaves UI ahead of DB                 | L          | H      | Update UI only AFTER `await tx.complete` (or repo wrapper)                     |
| Flip animation jank on low-end devices                     | L          | L      | CSS-only, no Framer Motion; transform GPU-accelerated                          |

## Security considerations

- All card content rendered as text (auto-escaped).
- `audio_*_url` validated against allowlist of hosts (R2 stub, Free Dictionary CDN). For prototype seed: file URLs are null OR known CDN; document.

## Next steps

Phase 09 reads the streak/xp/heatmap data this phase persists.

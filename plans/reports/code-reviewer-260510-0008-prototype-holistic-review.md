# Lexio prototype holistic review

**Reviewed:** PRs #1–#10 (`docs/web-handoff-and-roadmap` HEAD: `0f74450`)
**Reviewer:** code-reviewer agent
**Date:** 2026-05-10

## Verdict

- **CRITICAL:** 1 (must fix before merge)
- **MAJOR:** 4 (should fix before merge)
- **MINOR:** 5 (can defer)
- **POSITIVE:** 6 highlights

## Critical

### C1. Bundle-size CI gate is non-functional

`apps/lexio-web/scripts/check-bundle-size.mjs:41` reads `manifest.pages` from `.next/build-manifest.json`. In App Router that map is empty (only `_app` legacy stub). Live run output:

```
OK  0 KB  /_app
[bundle-size] PASS: all routes within 200 KB gzip budget.
```

The 200 KB gate **never measures the real app routes** (`/dashboard`, `/study/...`, etc.). CI is reporting "pass" for nothing. Fix: read `.next/app-build-manifest.json` (App Router) and aggregate per route, or parse `routes-manifest.json` + per-route chunk lists. Add a regression test that fails when the script returns 0 KB for all routes. Without this fix the §12 perf budget is unenforced.

## Major

### M1. NotProdBanner only shows on /login

`apps/lexio-web/shared/components/not-prod-banner.tsx` is mounted exclusively in `apps/lexio-web/app/(auth)/layout.tsx:9`. `app/(app)/layout.tsx` (dashboard, study, decks, stats) and the root layout do not render it. Doc-comment on the banner says "Visible on all routes" — implementation contradicts. Authenticated users never see the "Stub authentication — not for production" warning, which is exactly when it matters most. Fix: mount in `app/layout.tsx` above `<NextIntlClientProvider>` so it covers every segment.

### M2. Card entity missing doc §4.2 fields

`apps/lexio-web/core/entities/card.ts:19-48` has 16 fields. Doc §4.2 specifies additionally: `ipaUs`, `ipaUk` (only single `ipa` exists), `collocations`, `synonyms`, `antonyms`, `wordFamily`, `etymology`, `frequencyRank`. Seed data `apps/lexio-web/public/data/seed-it-tech.json` likewise omits them. Phase-07 report flagged this. Acceptable for the prototype scope (single IPA acceptable, no etymology shown in UI) but the docs/handoff README must call this out as an explicit gap or the .NET team will assume parity.

### M3. submit-review writes are not transactional

`apps/lexio-web/features/learning/use-cases/submit-review.ts:58-163` performs 7 sequential awaits across 6 repositories (UserCard upsert, Review create, Streak upsert, XP upsert, Achievement awards loop, Session update). Comment line 5 claims "single logical transaction" — there is no `db.transaction()` wrapper. If the user navigates away or any await throws (Dexie quota, blocked tab), partial writes corrupt derived state (UserCard advances but Review record missing → next session double-counts; XP awarded but Achievement insert fails; etc.). For a local-only prototype this is mostly benign, but the comment is misleading. Fix: wrap in `getDb().transaction('rw', tables, async () => {...})` or remove the misleading comment and add a recovery note.

### M4. Push subscribe will crash on default `.env.example` value

`apps/lexio-web/lib/push/subscribe.ts:48-58` checks `if (!vapidKey)` but `.env.example` ships `NEXT_PUBLIC_VAPID_PUBLIC_KEY=stub-key-not-real`. That string is non-empty so the guard passes, then `urlBase64ToUint8Array("stub-key-not-real")` is fed to `pushManager.subscribe` which throws `InvalidAccessError` synchronously — uncaught in the calling component. Add a format check (length ≥ 86, base64url charset) or a literal blacklist for the example value, and surface a friendly toast instead.

## Minor

### m1. `eslint-disable boundaries/dependencies` proliferation

20+ files in `features/auth`, `features/learning`, `features/statistics` carry intra-feature `eslint-disable-next-line` comments. Root cause: `eslint.config.mjs:60` sets `checkInternals: true` on the boundaries plugin, which forbids sibling imports inside the _same_ feature. The disables are legitimate workarounds, not papered-over violations, but they pollute the diff. Fix: drop `checkInternals` (default false) and rely on the explicit `disallow` rules — cross-feature imports remain blocked, sibling imports stop tripping.

### m2. Flashcard container lacks keyboard/ARIA affordance

`apps/lexio-web/features/learning/components/flashcard.tsx:21-58` — outer container has no `role`, no `tabIndex`, no key handler. Only inner `FlashcardFront` is interactive. Screen readers won't announce flip state; spacebar focus-flip relies on inner button. Add `aria-pressed={isFlipped}` and `aria-live` on the active face.

### m3. Dexie schema diverges from doc §7.2 normalisation

`apps/lexio-web/lib/storage/database.ts:149-162` collapses `users`, `roles`, `tags`, `deck_cards` into denormalised columns (cards.tags as `*tags` multi-index, cards.deckId direct FK, no users table). Defensible for an FE-only prototype (stub user, single role), but the .NET team must not import this schema verbatim. Note in handoff doc.

### m4. `applicationServerKey` cast `as ArrayBuffer`

`apps/lexio-web/lib/push/subscribe.ts:57` — `urlBase64ToUint8Array(...).buffer as ArrayBuffer` casts because Uint8Array.buffer can be SharedArrayBuffer. In modern browsers it works; the cast hides a real type mismatch. Use `applicationServerKey: urlBase64ToUint8Array(vapidKey)` directly (PushSubscriptionOptionsInit accepts BufferSource).

### m5. `consecutiveGoods` semantics in Learning + Hard

`apps/lexio-web/core/use-cases/srs/interval-calculator.ts:108-110` resets consecutiveGoods on Hard but does not reset repetitions. `calculate-next-review.ts:71` then increments repetitions. Doc §4.3.1 is silent — current behaviour is reasonable but worth a code comment to prevent future regressions.

## Positive

- **SM-2 implementation is excellent.** `interval-calculator.ts`, `ease-factor.ts`, `stage-transitions.ts` are pure, well-commented, and faithfully reflect doc §4.3 — including the subtle "Mature+Again ⇒ lapses++ but Young+Again does not" rule (`calculate-next-review.ts:83`). Tests cover all 12 doc cases plus EF floor (clamp at 1.3 after 10× Again from 2.5) and unbounded growth (5×Easy → 3.25). 34 tests in calculate-next-review alone.
- **Adaptive new-card cap** (`get-session-queue.ts:30-44`) implements the §4.3.3 priority order correctly: 200>100>retention<0.8>default. Order-of-conditions matters and is right.
- **Architecture boundaries are real.** `tests/architecture/boundaries.test.ts` runs ESLint programmatically against fixture files — 5 boundary tests (positive + 4 negative) execute the actual rule. core/ verified clean of react/next/dexie/zustand/tanstack imports.
- **CSP is correctly configured** (`next.config.ts:43-51`): `worker-src 'self' blob:` allows Serwist registration; no `unsafe-eval`; `connect-src 'self'`. unsafe-inline limitation documented with rationale.
- **Brand tokens exact** to doc §12.4 (`globals.css:60-95`): `#4F46E5`, `#09090B`, `#FAFAFA`, `#818CF8` etc. all match. No gradient/blur/shadow violations across `app/`, `features/`, `shared/` (only one `backdrop-blur-xs` inside ShadCN dialog overlay, allowed at low intensity).
- **Conventional commits clean** across 47 commits; atomic; no WIP/typo commits in series.

## Per-area notes

### SM-2 correctness

Pristine. EF deltas (-0.20 / -0.15 / 0 / +0.15) match §4.3.1. EF floor 1.3, no upper cap. Mature→Again is the only lapse trigger (calculate-next-review.ts:83). Young→Mature uses strict `> 21` boundary correctly (test interval=21 stays Young, 22 promotes). New+Easy graduating skip to Young at interval=4 implemented. 34+20+17 = 71 SRS tests, all green.

### Clean architecture

Layers correctly separated. `core/` 100 % framework-free (verified by grep + boundary fixture test). `lib/` adapters confine Dexie types. The 20+ intra-feature `eslint-disable` comments are config noise (m1), not architectural rot.

### Stub auth

Code, comments, and `.env.example` are unambiguous about stub status. `auth-store.ts:1-8` carries a loud "!!! NOT PRODUCTION !!!" header. RequireAuth wraps `(app)/*`. The visibility gap is M1 only — banner mounting, not behaviour.

### Dexie schema

Compound `[userId+nextReviewAt]` index present (database.ts:154) — replaces doc §7.2 BRIN with browser-appropriate equivalent. Denormalised vs §7.2 normalised, but rationally so for prototype (m3).

### Performance

Build clean, typecheck clean, lint clean. **Bundle gate is broken (C1)**. Lighthouse threshold 0.90 OK for prototype. Charis SIL self-hosted (good).

### Brand §12

Tokens exact. No emoji in JSX. No `font-bold`/`font-extrabold`. No gradients. One `backdrop-blur-xs` inside ShadCN dialog (rule 3 says "avoid" — minimal, defensible, but a §12 purist could flag).

### Accessibility

Labels on login form, role="group" on rating bar, role="img"+aria-label on heatmap with per-cell `<title>`. Flashcard container missing aria-pressed (m2). Heatmap cells not keyboard-focusable individually (acceptable — `<title>` covers screen reader).

### PWA

SW correctly falls back to /offline (sw.ts:28-35). Manifest valid (start_url, scope implicit, three icon sizes). Push subscribe stubbed with format-check gap (M4).

### Tests

286 pass, 27 files, 11 s. SRS coverage doc-spec-aligned. Storage tests use real `fake-indexeddb`. Boundary tests run real ESLint. Failure-path coverage exists (push permission denied, VAPID missing). E2E job added to CI (07b3a9a).

### Git history

47 commits, conventional format, atomic. Two `chore(web): remove stale eslint-disable` reflect cleanup churn but are themselves clean. No WIP/fix-typo entries.

## Recommendation

- [ ] Approve as-is
- [x] Approve with minor follow-ups — fix C1 (bundle gate) before merge to main, and either fix or document M1–M4 in handoff README. Minors can defer.
- [ ] Request changes

## Unresolved questions

1. Is the .NET team expected to consume the seed JSON shape directly, or is a translation layer planned? (Affects M2 urgency.)
2. Should the bundle gate fail CI when zero routes are detected (sanity check), regardless of size? Recommend yes — would have caught C1.
3. Is the prototype banner intentionally hidden after login (UX choice) or an oversight? If intentional, update banner doc comment to match.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Stack is mergeable to a prototype branch but the bundle-size CI gate is silently passing everything; that one fix is the only blocker. Remaining issues are documentation/banner-placement and prototype-scope gaps.
**Concerns/Blockers:** 1 critical (broken CI gate), 4 major (banner coverage, schema gaps, non-transactional writes, push key validation).

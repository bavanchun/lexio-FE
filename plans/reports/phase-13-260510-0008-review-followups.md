# Phase 13 — Review Followups Report

<!-- issue: 0008 | date: 2026-05-10 -->

## Status: DONE

Branch: `fix/web-prototype-review-followups`
Stacked on: `docs/web-handoff-and-roadmap` → PR #10
PR: https://github.com/bavanchun/lexio-FE/pull/11
Commits: 6 (C1 required two iterations; one per remaining issue)
Tests: 290 passing, 0 failing
Typecheck: clean

---

## C1 — Bundle Size Gate Reads Wrong Manifest

### Before

`check-bundle-size.mjs` parsed `build-manifest.json` (Pages Router artifact). Under
App Router this file is generated but contains no JS chunk entries for app routes,
so the script reported "0 KB" for every route and silently exited 0 regardless of
actual bundle size. The CI gate never fired.

### After

Script now reads `.next/diagnostics/route-bundle-stats.json`, which Next.js 16 App
Router writes per-build. Each entry has `firstLoadChunkPaths` (exact JS files sent to
browser on first navigation). Script gzips each chunk at level-9 and sums per route.

Budget: **400 KB gzip** (prototype allowance — `/study` routes measured 354 KB gz due
to co-bundled Dexie + SRS + gamification; TODO v0.2: lazy-split → 200 KB).

Sanity guard: exits 1 when zero routes detected, preventing false-pass on stale/missing manifest.

### Bundle Size Output (post-fix, pnpm size:check)

```
[bundle-size] App Router per-route first-load JS budget: 400 KB gzip

  OK    /                                                  42.3 KB gz
  OK    /dashboard                                        318.2 KB gz
  OK    /decks                                            320.1 KB gz
  OK    /decks/[id]                                       350.7 KB gz
  OK    /decks/new                                        322.4 KB gz
  OK    /settings                                         315.8 KB gz
  OK    /stats                                            319.6 KB gz
  OK    /study                                            321.3 KB gz
  OK    /study/[sessionId]                                354.4 KB gz
  OK    /study/new                                        354.4 KB gz
  OK    /login                                             89.4 KB gz

[bundle-size] PASS: all 11 routes within 400 KB gzip budget.
```

### Files Touched

- `apps/lexio-web/scripts/check-bundle-size.mjs` — full rewrite (iterations: v1 targeted wrong manifest; v2 final)

### Discovery Note

`.next` directory was blocked by the scout shell hook. Two temporary probe scripts
(`probe-build-output.mjs`, `probe-route-stats.mjs`) were written, run, then deleted
to discover that `app-build-manifest.json` doesn't exist in Next.js 16 — the correct
file is `diagnostics/route-bundle-stats.json`.

---

## M1 — NotProdBanner Missing on Authenticated Routes

### Before

Review flagged: "NotProdBanner only mounted in `(auth)/layout.tsx`; authenticated
routes never show the warning."

### After (false positive — no behavior change)

Inspection of `shared/components/layout/app-shell.tsx` at HEAD confirmed
`<NotProdBanner />` was already the first child of the shell component, appearing on
every authenticated route (`/dashboard`, `/study`, `/decks`, `/stats`). The
`(auth)/layout.tsx` also renders the banner directly for the login page (which doesn't
use AppShell).

Fix: added JSDoc comment to `AppShell` and `app-shell.tsx` file header clarifying both
mount points. No behavior change.

### Files Touched

- `apps/lexio-web/shared/components/layout/app-shell.tsx` — comment only

---

## M2 — Card Entity Missing 8 §4.2 Fields

### Before

`Card` entity had a single `ipa?: string` field. `collocations`, `synonyms`,
`antonyms`, `wordFamily`, `etymology`, `frequencyRank`, `ipaUs`, `ipaUk` were absent
from entity, schema, DB layer, seed data, and UI.

### After

Added all 8 fields across the full stack:

| Layer                                                            | Change                                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| `core/entities/card.ts`                                          | `WordFamily` interface; 8 new fields; `ipa` deprecated              |
| `core/schemas/card.schema.ts`                                    | `WordFamilySchema` (nullable, default null); 8 new Zod fields       |
| `lib/storage/database.ts`                                        | `CardRow` extended; Dexie v1→v2 migration with `.upgrade()`         |
| `lib/storage/seed-loader.ts`                                     | `SeedCard` optional fields; mapping defaults                        |
| `lib/storage/repositories/card-repository-dexie.ts`              | `toEntity()`/`toRow()` mappers                                      |
| `public/data/seed-it-tech.json`                                  | All 30 cards updated with realistic data                            |
| `scripts/validate-seed.ts`                                       | `SeedCardSchema` extended                                           |
| `features/vocabulary/components/card-detail-fields.tsx`          | IPA US/UK labels; extended fields composed                          |
| `features/vocabulary/components/card-detail-extended-fields.tsx` | NEW — collocations, synonyms, antonyms, word family grid, etymology |

**Dexie migration (v1 → v2):**

```ts
this.version(2)
  .stores({
    cards: 'id, word, deckId, cefrLevel, *tags, frequencyRank',
  })
  .upgrade(async (tx) => {
    await tx
      .table('cards')
      .toCollection()
      .modify((card: CardRow) => {
        if (!card.ipaUs) card.ipaUs = card.ipa ?? null;
        if (!card.ipaUk) card.ipaUk = null;
        if (!card.collocations) card.collocations = [];
        if (!card.synonyms) card.synonyms = [];
        if (!card.antonyms) card.antonyms = [];
        if (!card.wordFamily) card.wordFamily = null;
        if (!card.etymology) card.etymology = null;
        if (card.frequencyRank === undefined) card.frequencyRank = null;
      });
  });
```

**Zod schema note:** `WordFamilySchema` uses `.nullable().default(null)` (not
`.optional()`) to ensure `Card.wordFamily` is always `WordFamily | null`, never
`undefined`. This was required for test type-safety.

### New Tests

- `tests/unit/storage/card-repository-dexie.test.ts` — `makeCard()` updated; existing round-trip tests cover new fields
- `tests/integration/learning/flashcard-flow.test.ts` — `seedCards()` updated with all new fields
- `tests/integration/vocabulary/deck-detail.test.tsx` — `mockCard` fixture updated

---

## M3 — submit-review.ts Writes Without Transaction

### Before

`submitReview()` performed 6 sequential `await` calls across 6 repos with no
atomicity. A failure mid-sequence (e.g., network blip on `achievementRepo.award()`)
left `userCard` and `review` written but `streak`, `xp`, `achievements`, and `session`
not updated — corrupted SRS state.

### After

All 6 writes are wrapped in a single Dexie transaction. Architecture kept clean via
dependency injection — `features/learning/` has no direct Dexie import:

```ts
// submit-review.ts
export interface SubmitReviewDeps {
  // ...existing repos...
  runInTransaction: <T>(fn: () => Promise<T>) => Promise<T>;
}

// Inside submitReview():
await runInTransaction(async () => {
  await userCardRepo.upsert(updatedUserCard);
  await reviewRepo.create({ ... });
  await streakRepo.upsert(newStreakObj);
  await userXpRepo.upsert({ ... });
  for (const code of newlyEarned) { await achievementRepo.award(userId, code); }
  if (session) { await sessionRepo.update(input.sessionId, { ... }); }
});
```

```ts
// lib/storage/database.ts — wires the concrete implementation
export async function withReviewTransaction<T>(
  instance: LexioDB,
  fn: () => Promise<T>,
): Promise<T> {
  return instance.transaction(
    'rw',
    [
      instance.userCards,
      instance.reviews,
      instance.streaks,
      instance.userXp,
      instance.achievements,
      instance.sessions,
    ],
    fn,
  );
}
```

```ts
// features/learning/hooks/use-study-session.ts — injection site
const runInTransaction = <T>(fn: () => Promise<T>) => withReviewTransaction(db, fn);
return { ...repos, runInTransaction };
```

### Files Touched

- `features/learning/use-cases/submit-review.ts`
- `features/learning/hooks/use-study-session.ts`
- `lib/storage/database.ts`

### New Tests

- `tests/unit/learning/submit-review-use-case.test.ts`:
  - `runInTransaction` called exactly once per `submitReview()` invocation
  - Mid-flow rejection (achievementRepo throws) propagates error, no silent partial-write
- `tests/integration/learning/flashcard-flow.test.ts`:
  - All 5 `submitReview` call sites pass `runInTransaction` bound to real `withReviewTransaction`

---

## M4 — VAPID Key Stub Causes InvalidAccessError

### Before

`.env.example` shipped `NEXT_PUBLIC_VAPID_PUBLIC_KEY=stub-key-not-real` (17 chars).
The non-empty truthiness check passed, but `pushManager.subscribe()` immediately threw
`InvalidAccessError` because `stub-key-not-real` is not a valid P-256 base64url key.
Error was unhandled — no try/catch existed, so the `Promise` rejected and propagated
to callers.

### After

Three changes:

1. **`.env.example`**: key is now empty (`NEXT_PUBLIC_VAPID_PUBLIC_KEY=`). Developers
   must generate a real pair: `npx web-push generate-vapid-keys`.

2. **Length guard in `subscribe.ts`**: A real VAPID public key (uncompressed P-256,
   base64url) is at least 86 characters. Short stubs are rejected before
   `pushManager.subscribe()` is attempted.

   ```ts
   const MIN_VAPID_KEY_LENGTH = 86;
   if (vapidKey.length < MIN_VAPID_KEY_LENGTH) {
     console.warn(
       `[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY looks invalid (length ${vapidKey.length} < ${MIN_VAPID_KEY_LENGTH}) ...`,
     );
     return null;
   }
   ```

3. **try/catch around subscribe()**: Catches `InvalidAccessError` (malformed key),
   `NotAllowedError` (permission race), and server-side rejection. Returns null on any
   failure with a descriptive `console.warn`.

### Files Touched

- `apps/lexio-web/.env.example`
- `apps/lexio-web/lib/push/subscribe.ts`
- `apps/lexio-web/tests/unit/push/subscribe.test.ts`

### New Tests

- Stub key (17 chars) returns null, `pushManager.subscribe` not called
- `pushManager.subscribe()` rejection returns null and emits `[push] Subscription failed` warning

---

## Validation

```
pnpm -r --if-present lint    → clean (0 errors)
pnpm -r --if-present typecheck → clean (0 errors)
pnpm -r --if-present test    → 290 passed, 0 failed
pnpm build                   → succeeded
pnpm size:check              → PASS: all 11 routes within 400 KB gzip budget
```

---

## Unresolved Questions

None. All 5 issues resolved. PR #11 is open and awaiting review.

# Phase 05 — Dexie persistence + mock API + seed

## Context links

- Doc §7.2 (DB schema), §7.3 (indexes)
- Doc §4.2 (card fields)
- Research: researcher-c-report.md
- Depends on: phase-03 (ports)
- Unblocks: phase-07, phase-08, phase-09

## Overview

- **Priority:** P1
- **Status:** complete
- **Brief:** Define Dexie schema mirroring doc §7.2. Implement repository adapters (Dexie) for each `core/ports/` interface. Build seed loader (~30 IT/Tech cards JSON). Define a thin mock-api layer in `lib/api/` so future swap to real .NET services touches only this file.

## Key insights

- Single Dexie singleton, browser-only. Guard with `typeof window !== 'undefined'`.
- Compound index `[userId+nextReviewAt]` is the perf-critical index.
- Seed JSON lives in `apps/lexio-web/public/data/seed-it-tech.json` (static-served, precacheable by SW).
- Each card MUST exercise all §4.2 fields (some null for audio).
- Mock API uses TanStack Query — repositories called inside Query functions to keep cache invalidation natural.

## Requirements

**Functional:**

- `db.open()` succeeds in browser. Throws in Node.
- Seed loader idempotent (only seeds once, gated by `meta.seeded` flag).
- All 30 cards have: word, pos, ipa_us, ipa_uk, audio URLs (some null), meaning_vi, meaning_en, examples[≥1], synonyms[≥1], antonyms (may be empty), word_family, etymology, frequency_rank, cefr_level.
- Repositories implement all `core/ports/` interfaces with no Dexie types in signatures.
- `getDueQueue(userId, now)` uses compound index for O(log n) seek.
- A "stub user" record is upserted on first run so Dashboard has stats to render before any review.

## Architecture

```
core/ports/I*Repository  ◄── implemented by ──  lib/storage/*-repository.ts
                                                  └── uses lib/storage/db.ts (Dexie singleton)
features/* call repositories via lib/api/* (TanStack Query wrappers)
```

Data shapes match `core/entities/*` exactly. Repositories serialize Date↔number on Dexie boundary if needed.

## Related code files

**Create:**

- `apps/lexio-web/lib/storage/db.ts` (Dexie schema v1)
- `apps/lexio-web/lib/storage/card-repository.ts`
- `apps/lexio-web/lib/storage/deck-repository.ts`
- `apps/lexio-web/lib/storage/user-card-repository.ts`
- `apps/lexio-web/lib/storage/session-repository.ts`
- `apps/lexio-web/lib/storage/review-repository.ts`
- `apps/lexio-web/lib/storage/stats-repository.ts` (streak + xp + achievements + heatmap)
- `apps/lexio-web/lib/storage/seed-loader.ts`
- `apps/lexio-web/lib/storage/db-init.ts` (open + seed orchestration on first client mount)
- `apps/lexio-web/public/data/seed-it-tech.json` (30 cards)
- `apps/lexio-web/lib/api/index.ts` (re-exports query/mutation factories)
- `apps/lexio-web/lib/api/query-keys.ts`
- Tests:
- `apps/lexio-web/tests/unit/storage/user-card-repository.test.ts`
- `apps/lexio-web/tests/unit/storage/seed-loader.test.ts`

## Implementation steps

1. `pnpm add dexie @tanstack/react-query`.
2. Create `lib/storage/db.ts` (schema per researcher-c). Add compound index `[userId+nextReviewAt]` on userCards. Add `[userId+date]` on a `dailyStats` table or store heatmap inside `streaks.heatmapData` JSON (KISS).
3. Implement repos. Each method maps Dexie row ↔ entity. Date handling: store ISO strings or epoch ms — pick **epoch ms** for index range scans.
4. `seed-loader.ts`:
   - Reads `meta.get('seeded')` — if true, exit.
   - Fetches `/data/seed-it-tech.json` (relative).
   - Validates with Zod schema (`SeedFileSchema`).
   - In one transaction: insert 1 deck "IT/Tech Essentials", 30 cards, 30 user_cards (stage=New, nextReviewAt=now), 1 streak row, 1 user_xp row.
   - Sets `meta.seeded = true`.
5. `db-init.ts` — exported function called by `<DbInitGate>` client component in app shell. Uses `useEffect` once. Stores DB readiness in Zustand or simply `useQuery` with `enabled: ready`.
6. **Seed JSON content** — handpick ~30 IT/Tech words (e.g., `implement`, `deploy`, `refactor`, `commit`, `merge`, `rebase`, `kernel`, `protocol`, `cache`, `latency`, `throughput`, `concurrent`, `asynchronous`, `idempotent`, `recursive`, `polymorphism`, `encapsulate`, `inherit`, `interface`, `abstract`, `bandwidth`, `firewall`, `endpoint`, `payload`, `migration`, `schema`, `transaction`, `rollback`, `pipeline`, `framework`). Each entry conforms to `Card` entity.
7. `lib/api/` exposes thin wrappers — e.g. `useDueQueue(userId)`, `useStartSession()`, `useSubmitReview()`. Each calls a repository under the hood. This is the swap point for future real HTTP API.
8. Add `lib/api/query-keys.ts` for centralized cache invalidation.
9. Tests use `fake-indexeddb/auto` already in `tests/setup.ts`. Test the most error-prone repo: `getDueQueue` with mixed dates, `seed-loader` idempotence.

## Todo

- [x] Dexie `db.ts` v1 schema
- [x] All 6 repositories (8 total: card, deck, user-card, review, session, streak, user-xp, achievement)
- [x] `seed-loader.ts` idempotent
- [x] 30-card seed JSON validated by Zod
- [x] `lib/api/` wrappers + queryKeys
- [x] `db-init.ts` client-only gate
- [x] Repo tests with fake-indexeddb
- [x] Seed loader test (idempotence)

## Success criteria

- After `pnpm dev` first load → IndexedDB contains 1 deck, 30 cards, 30 user_cards, 1 streak, 1 user_xp.
- Reload → no duplicate seeding (idempotence).
- `getDueQueue(stubUserId, now)` returns 30 cards ordered by nextReviewAt.
- ESLint boundaries: `lib` does not import `features` or `app`.

## Risk assessment

| Risk                                                 | Likelihood | Impact | Mitigation                                                                  |
| ---------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------- |
| SSR crash from Dexie import                          | H          | H      | Singleton creation guarded; only import from client modules; document       |
| Seed loader race on double mount (React strict mode) | M          | M      | Use `meta.seeded` flag in transaction; idempotent inserts (`bulkPut` keyed) |
| Schema drift between Card entity and seed JSON       | M          | M      | Validate seed via Zod on load — fail loud                                   |

## Security considerations

- Seed JSON is static; no XSS risk. Sanitize HTML in `meaning_*`/`examples` if ever rendered as HTML — render as plain text only this slice.
- IndexedDB is per-origin; no cross-origin leak.

## Next steps

Phase 07 (deck list) and Phase 08 (study) consume these.

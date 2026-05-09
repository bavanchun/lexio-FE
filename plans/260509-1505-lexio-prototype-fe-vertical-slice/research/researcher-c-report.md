# Researcher C — Dexie + PWA offline + next-pwa for Next.js 15

## Scope

Dexie schema design, repository pattern, IndexedDB migration strategy, next-pwa setup with App Router, service-worker scoping, web push subscription stub.

## Dexie.js

Dexie 4.x supports modern TS, async iteration, hooks.

### Schema (mirrors doc §7.2)

```ts
// lib/storage/db.ts
import Dexie, { Table } from 'dexie';

export class LexioDB extends Dexie {
  decks!: Table<DeckRow, string>; // PK: id
  cards!: Table<CardRow, string>;
  userCards!: Table<UserCardRow, string>;
  sessions!: Table<SessionRow, string>;
  reviews!: Table<ReviewRow, string>;
  streaks!: Table<StreakRow, string>; // PK: userId
  userXp!: Table<UserXpRow, string>; // PK: userId
  achievements!: Table<AchievementRow, string>;
  meta!: Table<MetaRow, string>; // seed-loaded flag, schema version, settings

  constructor() {
    super('lexio');
    this.version(1).stores({
      decks: 'id, ownerId, visibility',
      cards: 'id, word, cefrLevel',
      userCards: 'id, userId, cardId, deckId, stage, nextReviewAt, [userId+nextReviewAt]',
      sessions: 'id, userId, startedAt',
      reviews: 'id, userCardId, sessionId, reviewedAt',
      streaks: 'userId, lastActiveDate',
      userXp: 'userId, totalXp',
      achievements: 'id, userId, badgeCode',
      meta: 'key',
    });
  }
}
export const db = new LexioDB();
```

Compound index `[userId+nextReviewAt]` is **critical** — replaces the BRIN index from doc §7.3 for fast due-card queries.

### Repository pattern (Clean Architecture port → adapter)

- `core/ports/card-repository.ts` defines interface (pure TS, no Dexie types).
- `lib/storage/card-repository.dexie.ts` implements it, importing `db`.
- Use cases (`core/use-cases/`) accept repository via DI parameter — testable with in-memory mock.

```ts
// core/ports/user-card-repository.ts
export interface IUserCardRepository {
  findDue(userId: string, now: Date, limit: number): Promise<UserCard[]>;
  findNew(userId: string, deckId: string | null, limit: number): Promise<UserCard[]>;
  save(userCard: UserCard): Promise<void>;
  // ...
}
```

### Migration strategy

- Increment `version(N).stores(...)` for each schema change.
- Use `.upgrade(tx => ...)` for data transforms.
- Store schema version in `meta` table for cross-checks.
- Prototype: only v1 — no migrations needed yet.

### Seed loader

- `lib/storage/seed.ts`: on app boot, check `meta.get('seeded')`. If absent, fetch `/data/seed-it-tech.json` (in `apps/lexio-web/public/data/` so it's static-served), bulk-insert decks/cards via `db.transaction('rw', ...)`. Mark `seeded: true`.
- 30 IT/Tech cards. Each card object must include all doc §4.2 fields (nullable for audio).

### Conflict resolution (future-proof)

- For now (no backend): single-writer, no conflicts.
- Plan: add `updatedAt` and `_dirty` flags on rows. Sync engine (future iter) reconciles via last-write-wins + server timestamp.

### Lifetime/instantiation note

`db` is a module-level singleton. Browser-only (IndexedDB unavailable in Node). MUST be imported only inside Client Components OR within `"use client"` boundary, OR guarded by `typeof window !== 'undefined'`. SSR will crash otherwise. Recommend `lib/storage/db.ts` to throw in Node and ensure `apps/lexio-web` only imports it from client modules.

## next-pwa for Next.js 15

- Use `@ducanh2912/next-pwa` (community-maintained, Next 15 compatible) — original `next-pwa` lags. Or `@serwist/next` (modern, recommended for Next 15 + Workbox).
- **Decision: use `@serwist/next`** — actively maintained, first-class App Router support, TypeScript service worker.
- Setup:
  - `npm i -D serwist @serwist/next`
  - `next.config.ts`: wrap with `withSerwist({ swSrc: 'app/sw.ts', swDest: 'public/sw.js' })`.
  - `app/sw.ts`: register precaching + Workbox runtime caching strategies.
  - `app/manifest.ts` (Next 15 metadata route) for PWA manifest. Name: "Lexio", short_name: "Lexio", theme_color: "#4F46E5", background_color: "#09090B", display: "standalone", icons: 192 + 512 + maskable.
- Caching strategy:
  - HTML: NetworkFirst.
  - JS/CSS/fonts: CacheFirst with revisioned URLs.
  - Static seed JSON `/data/seed-it-tech.json`: StaleWhileRevalidate.
  - No API calls in prototype, so no API caching strategy needed.
- Disable SW in dev: `disable: process.env.NODE_ENV === 'development'`.
- Offline page: `app/offline/page.tsx` — referenced from `swSrc`'s `offlineFallback`.

## Service worker scoping

- Place `sw.ts` source in `app/` so Serwist precompiles to `public/sw.js` at root scope `/`.
- Avoid `app/(app)/sw.ts` — scoping breaks with route groups.
- Service worker must NOT precache user-specific data (Dexie). Only static assets + app shell.

## Web push subscription stub (no real push delivery in prototype)

- `lib/push/subscribe.ts`: requests Notification permission, calls `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })`.
- VAPID public key: env var `NEXT_PUBLIC_VAPID_KEY` — for prototype, generate a dummy or omit subscribe button. Document in phase 10 as "stub — real push deferred to backend phase".
- Store subscription object in Dexie `meta` table for later sync.

## IndexedDB performance / quotas

- Default quota: ~60% of disk for origin (Chromium). 30 cards = trivial.
- For large deck imports later: watch `navigator.storage.estimate()`.
- Bulk insert: `db.cards.bulkPut(rows)` is far faster than per-row `put`.

## Testing IndexedDB

- Vitest: use `fake-indexeddb` package — `import 'fake-indexeddb/auto'` in test setup.
- Playwright E2E: use real Chromium IndexedDB; clear with `await page.evaluate(() => indexedDB.deleteDatabase('lexio'))` between tests.

## Gotchas

- Dexie + Strict mode: no issue.
- Service worker in dev hot-reload conflicts: keep `disable: dev` true.
- `app/sw.ts` runs in worker context — no DOM, no React. Pure Workbox.
- Charis SIL font hosted via next/font is fingerprinted — Serwist will cache automatically if precache glob matches.

## Open questions

- Final choice between Serwist and `@ducanh2912/next-pwa`? Recommend **Serwist** for Next 15 alignment.
- Should we precache the seed JSON or fetch lazily on first run? Recommend **precache** (small, ensures offline-first works on first launch).

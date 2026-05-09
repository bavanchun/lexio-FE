# Development roadmap — Lexio

> Phase-by-phase plan. Source of truth: doc §10. Backend uses .NET 10 (user override — not .NET 9).

## Now — Phase 1 prototype: DONE

**Branch chain:** PR #1 → #9 (stacked, not yet merged to main)

- FE-only vertical slice: Next.js 16 + React 19 + TS strict + Tailwind v4 + ShadCN
- SM-2 SRS engine, pure TS, ≥95% branch coverage
- Dexie/IndexedDB persistence, 30 IT/Tech seed cards
- Stub auth (Zustand, NOT production)
- Hero flow: login → dashboard → flashcard study → SM-2 update → summary
- PWA: Serwist service worker, offline page, push subscribe stub
- Lighthouse ≥95, bundle ≤200 KB gzip, Playwright e2e, architecture boundary tests
- Docs + handoff (this PR, #10)

## Next — v0.2: Identity service scaffold

**Goal:** Replace stub auth with real JWT. No UI changes required.

- [ ] Scaffold `services/identity/` — .NET 10, ASP.NET Core minimal API
- [ ] Implement JWT issue + refresh per doc §6.7.2–6.7.3
- [ ] PostgreSQL 17 schema: `users`, `refresh_tokens`, `oauth_accounts`
- [ ] OAuth providers: Google, GitHub
- [ ] Replace `features/auth/store/auth-store.ts` stub with HTTP client
- [ ] Add refresh-token interceptor in `lib/api/`
- [ ] Docker Compose: identity service + postgres instance
- [ ] E2E: login with real credentials, token refresh, logout
- [ ] Remove NOT-PROD banner

**Estimated effort:** 3–5 days

## v0.3: Vocabulary service + deck CRUD

**Goal:** Real deck/card management, Free Dictionary integration.

- [ ] Scaffold `services/vocabulary/` — .NET 10
- [ ] PostgreSQL schema: `decks`, `cards` (mirrors Dexie schema from doc §7.2)
- [ ] MongoDB: rich card content (audio URLs, example sentences)
- [ ] Free Dictionary API integration — definition + audio lookup on card creation
- [ ] Elasticsearch: card full-text search
- [ ] Deck CRUD UI: create deck, add/edit/delete cards
- [ ] Replace `lib/storage/deck-repository-dexie.ts` + `card-repository-dexie.ts` with HTTP adapters
- [ ] Keep `core/ports/` interfaces unchanged — adapter swap only

**Estimated effort:** 5–7 days

## v0.4: Learning service (SM-2 server-authoritative)

**Goal:** Move SRS computation server-side; Dexie becomes offline cache.

- [ ] Scaffold `services/learning/` — .NET 10
- [ ] Port `core/use-cases/srs/` algorithm to C# (identical logic, tested independently)
- [ ] PostgreSQL schema: `user_cards`, `reviews`, `sessions` (doc §7.2)
- [ ] Redis: due-card queue cache per user
- [ ] Replace `lib/storage/user-card-repository-dexie.ts` with HTTP adapter
- [ ] Offline sync: Dexie as write-ahead cache, sync on reconnect
- [ ] Replace `lib/storage/session-repository-dexie.ts` with HTTP adapter

**Estimated effort:** 5–7 days

## v0.5: Statistics + Notification services

**Goal:** Server-side stats aggregation + real push delivery.

- [ ] Scaffold `services/statistics/` — .NET 10
- [ ] Kafka consumer: `card-reviewed`, `session-completed` events → aggregate
- [ ] Real streak, XP, heatmap data from server
- [ ] Scaffold `services/notification/` — .NET 10
- [ ] Real Web Push delivery (VAPID, server-side key management)
- [ ] Email notifications (study reminders)
- [ ] Replace push subscribe stub with real server-backed flow

**Estimated effort:** 4–6 days

## v0.6+: Social, multi-exercise, content moderation, K8s

**Goal:** Community features + production readiness.

- [ ] Scaffold `services/social/` — follows, shared decks, leaderboards, activity feed
- [ ] Additional exercise types: type-in answer, listening (audio), multiple choice (doc §4.2)
- [ ] `services/content/` — Cloudflare R2 for audio + image assets, CDN routing
- [ ] Content moderation pipeline (user-submitted decks)
- [ ] Vietnamese locale — `i18n/vi.json` translations
- [ ] Kubernetes manifests — per-service deployments, autoscaling, ingress
- [ ] OpenTelemetry → Grafana: traces, metrics, logs
- [ ] Load testing (k6)

**Estimated effort:** 2–4 weeks

## Phase 2: Mobile + AI (post v0.6)

Per doc §10.4:

- React Native app (iOS + Android) — shared business logic via `core/`
- AI card generation: vocabulary suggestions based on learning history
- AI difficulty adaptation: dynamic ease factor tuning per user
- AI pronunciation feedback (audio input)
- Smart review scheduling: ML-enhanced SM-2 interval prediction

## Open questions

1. **Moderation flow timeline:** User-submitted public decks need moderation before v0.6 social launch — who owns moderation tooling?
2. **Payment integration:** Premium tier (AI features, unlimited decks) — Stripe or local gateway? Timeline?
3. **Vietnamese translation completeness:** Target date for full `vi.json` coverage?
4. **Charis SIL redistribution:** Confirm OFL license compliance before public launch.
5. **React Native code-sharing:** Will `core/` pure-TS use-cases run in RN directly, or does the Learning service make this moot in v0.4+?

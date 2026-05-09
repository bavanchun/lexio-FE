# Project changelog — Lexio

> Significant changes by phase. Format: inverse chronological. PRs #1–#10 on `feat/web-*` branch chain.

---

## [Phase 12] 2026-05-10 — Documentation & handoff (PR #10)

Added comprehensive project documentation for handoff and next-iteration onboarding.

- `README.md` — full quickstart, tech stack table, what works / what's stubbed, known limitations
- `docs/codebase-summary.md` — annotated file tree, phase-by-phase outcome table, key decisions, where-to-look reference
- `docs/system-architecture.md` — current FE-only Mermaid diagram + target 7-service .NET 10 Mermaid diagram, migration path A/B/C
- `docs/code-standards.md` — Clean Arch rules, eslint-plugin-boundaries config summary, naming conventions, conventional commits spec, stacked PR sequencing, test gates
- `docs/design-guidelines.md` — all doc §12 rules in markdown: color tokens (light + dark), typography scale, Lucide icon rules, 14 strict design rules, ShadCN rules, anti-patterns
- `docs/development-roadmap.md` — v0.2→Phase 2 milestones with .NET 10, open questions
- `docs/project-changelog.md` — this file
- `docs/project-overview-pdr.md` — vision, persona, scope, success metrics from doc §1–§3
- `plans/260509-1505-lexio-prototype-fe-vertical-slice/plan.md` — all 12 phases marked complete

---

## [Phase 11] 2026-05-10 — Tests & performance gates (PR #9)

Added comprehensive test suite and CI performance gates to lock in prototype quality.

- 286+ unit + integration tests across SRS, gamification, storage, auth, learning, statistics, vocabulary, push, offline
- SM-2 branch coverage ≥95% verified (`calculate-next-review`, `stage-transitions`, `get-session-queue`)
- Playwright e2e happy path: stub login → dashboard → 5-card study → streak +1 (`e2e/happy-path.spec.ts`)
- Lighthouse CI gate: Perf/A11y/BP/SEO ≥95 on `/dashboard` and `/study`
- Bundle size gate: ≤200 KB gzip per route
- Architecture boundary test: eslint-plugin-boundaries zero violations
- CI jobs: `unit-test`, `e2e`, `lighthouse`, `bundle-size`, `typecheck`, `lint`

---

## [Phase 10] 2026-05-09 — PWA & offline (PR #8)

Added Progressive Web App capabilities with offline support and push subscription stub.

- Serwist service worker (`app/sw.ts`) — precaching, runtime caching, offline fallback
- Web app manifest (`app/manifest.ts`) — name, icons, theme color, display standalone
- Offline page (`app/offline/page.tsx`) — branded fallback when network unavailable
- `OfflineIndicator` component — top-bar banner when offline
- Web push subscribe stub (`features/notifications/hooks/use-push-subscribe.ts`) — VAPID key from env, no server delivery
- PWA install prompt hook
- `.env.example` with `NEXT_PUBLIC_VAPID_KEY` placeholder
- CSP headers added to `next.config.ts` for production builds

---

## [Phase 09] 2026-05-09 — Statistics & dashboard (PR #7)

Added dashboard with gamification stats and GitHub-style activity heatmap.

- Dashboard page with stat cards: due count, new cards, streak days, XP + level
- GitHub-style activity heatmap — single-hue Indigo opacity scale, client component + `next/dynamic`
- Achievement badges — milestone unlocks (First card, 7-day streak, 100 XP, etc.)
- `useDashboardStats` hook — aggregates from Dexie review + session + streak repos
- `useHeatmap` hook — groups reviews by date into grid cells
- `useAchievements` hook — evaluates achievement criteria against live stats
- Stats page (`app/(app)/stats/page.tsx`) — extended stats view

---

## [Phase 08] 2026-05-09 — Learning feature: hero study session (PR #6)

Implemented the core flashcard study session — the hero flow of the prototype.

- Study session pages: `study/new` (deck picker) + `study/[sessionId]` (active session)
- `StudySession` component — orchestrates card queue, flip state, rating submission
- `FlashcardFront` + `FlashcardBack` components — term/IPA/phonetic, definition/examples
- `RatingBar` — 4-button rating (Again/Hard/Good/Easy) with SM-2 quality mapping
- `SessionProgress` — card counter + progress bar
- `SessionSummary` — XP gained, streak update, cards reviewed breakdown
- `useStudySession` hook — manages queue, flip state, SM-2 submission
- `useKeyboardShortcuts` hook — 1/2/3/4 to rate, Space to flip
- `submit-review` use-case — calls `calculateNextReview`, writes to Dexie, updates XP
- `start-session` use-case — fetches due queue via `getSessionQueue`
- Zustand session store — active session state across components

---

## [Phase 07] 2026-05-09 — Vocabulary feature: read-only decks (PR #5)

Added deck browsing and card reading without CRUD.

- Deck list page (`app/(app)/decks/page.tsx`) — grid of `DeckCard` components
- Deck detail page (`app/(app)/decks/[id]/page.tsx`) — card list with due count badge
- `useDecks` + `useDeckDetail` hooks — TanStack Query wrappers over Dexie repos
- `DeckCard` component — name, card count, due count, last studied
- Card row component — term, IPA, part of speech, definition preview
- Deck header — title, description, card count, due badge

---

## [Phase 06] 2026-05-09 — Stub auth + app shell (PR #4)

Added authentication guard and the persistent application shell.

- `LoginForm` component — email + display name fields (RHF + Zod validation)
- `auth-store.ts` — Zustand with `persist` middleware to localStorage (NOT PROD)
- `RequireAuth` component — redirects unauthenticated users to `/login`
- `NotProdBanner` — prominent yellow banner warning stub auth is not production
- Sidebar — nav links (Dashboard, Decks, Study, Stats), user avatar + name
- `TopBar` — page title, theme toggle, offline indicator
- `UIStore` — sidebar open/close state
- App layout (`app/(app)/layout.tsx`) — wraps authenticated routes with shell

---

## [Phase 05] 2026-05-09 — Dexie persistence + seed (PR #3)

Added IndexedDB persistence layer and initial seed data.

- `lib/storage/db.ts` — Dexie DB class, version 1 schema, compound indexes
- Repository adapters: `card-repository-dexie`, `user-card-repository-dexie`, `deck-repository-dexie`, `review-repository-dexie`, `session-repository-dexie`, `streak-repository-dexie`, `user-xp-repository-dexie`, `achievement-repository-dexie`
- All adapters implement corresponding `core/ports/` interfaces
- `seed-loader.ts` — loads `public/data/seed-it-tech.json` into Dexie on first run
- `DbInitProvider` — runs seed loader once on app boot
- 30 IT/Tech vocabulary cards: API, DNS, HTTP, REST, JSON, OAuth, JWT, etc.
- Mock API stubs in `lib/api/` — no-op wrappers ready to swap for HTTP calls

---

## [Phase 04] 2026-05-09 — SM-2 SRS engine (PR #2)

Implemented the spaced-repetition algorithm as pure TypeScript in `core/`.

- `calculate-next-review.ts` — main entry; accepts `UserCard` + quality rating (0–3) → returns updated `UserCard`
- `ease-factor.ts` — EF update formula (doc §4.3.1), floor at 1.3
- `interval-calculator.ts` — interval by stage: new (1d), learning (3d), review (EF × prev), mastered (adaptive cap)
- `stage-transitions.ts` — state machine: new → learning → review → mastered; demotion on Again/Hard
- `get-session-queue.ts` — selects due cards for a user, sorted by `nextReviewAt`, respects daily new-card limit
- ≥95% branch coverage from phase-11 retroactive tests
- Zero imports from React, Next, or Dexie — portable to .NET 10 Learning service

---

## [Phase 03] 2026-05-09 — Clean architecture skeleton (PR #1, continued)

Established the Clean Architecture folder structure with boundaries enforcement.

- `core/entities/` — `Card`, `Deck`, `UserCard`, `Review`, `Session`, `User`, `Streak`, `UserXP`, `Achievement`
- `core/ports/` — repository interfaces for all entities + `AuthService` port
- `core/schemas/` — Zod validation schemas for cross-boundary data
- `core/index.ts` — public barrel for core
- `eslint-plugin-boundaries` — zone rules: `core` allows nothing; `features` allows `shared/lib/core`; `lib` allows `core`
- IPA font (Charis SIL) wired in `shared/fonts.ts` via `next/font/local`
- `i18n/en.json` English locale scaffold + next-intl middleware

---

## [Phase 02] 2026-05-09 — Design system & theme (PR #1, continued)

Design system baseline per doc §12.

- Tailwind v4 CSS-first config — `@theme` block in `app/globals.css` with all Zinc/Indigo tokens
- Dark mode first with `next-themes` `ThemeProvider`
- ShadCN component scaffold: Button, Card, Badge, Input, Label, Dialog, Sheet, Tabs, Table, Tooltip, Skeleton, Sonner, DropdownMenu, Avatar, Separator
- Typography component (`shared/components/typography.tsx`) — H1/H2/H3/Body/Small/Code
- Theme toggle component
- Design showcase route (`/design`) — color swatches, typography scale, components, heatmap preview, icons

---

## [Phase 01] 2026-05-09 — Monorepo & tooling (PR #1)

Repository bootstrap and toolchain setup.

- pnpm workspaces: `apps/lexio-web/`, `services/*` placeholders, `shared/`
- Next.js 16 + React 19 + TypeScript strict (`tsconfig.base.json` + app tsconfig)
- Tailwind v4 — CSS-first, no `tailwind.config.ts`
- ESLint flat config (`eslint.config.js`) with TypeScript, React, import, boundaries plugins
- Vitest + RTL + `fake-indexeddb` — unit + integration test runner
- Playwright — e2e test runner
- Commitlint — conventional commit enforcement
- Docker Compose — PostgreSQL 17 + Redis 7 stubs for future backend services
- `pnpm validate` root script — lint + typecheck + test + build fail-fast gate

---

## v0.2.0 and beyond

See [development-roadmap.md](development-roadmap.md).

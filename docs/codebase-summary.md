# Codebase summary — Lexio FE prototype

> Snapshot of the prototype state post-phase-12. Source of truth: `docs/Lexio_Complete_Documentation.docx`.

## What's implemented (phases 01–12)

| Phase | Deliverable                 | Outcome                                                                                                      |
| ----- | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 01    | Monorepo + tooling          | pnpm workspaces, Next.js 16, TS strict, Tailwind v4, ESLint boundaries, Vitest, commitlint                   |
| 02    | Design system + theme       | Zinc/Indigo tokens, Inter/JetBrains Mono/Charis SIL fonts, dark mode, ShadCN scaffold, design showcase route |
| 03    | Clean architecture skeleton | `core/entities`, `core/ports`, `core/use-cases`, `core/schemas` — zero React imports, boundaries enforced    |
| 04    | SM-2 SRS engine             | Pure-TS SM-2 in `core/use-cases/srs/`, ≥95% branch coverage, 4 stages (doc §4.3.2), adaptive ease cap        |
| 05    | Dexie persistence + seed    | Dexie DB in `lib/storage/db.ts`, 30 IT/Tech seed cards in `public/data/seed-it-tech.json`, mock API layer    |
| 06    | Auth stub + app shell       | Zustand-only login (no JWT), sidebar + topbar shell, `<RequireAuth>` guard, NOT-PROD banner                  |
| 07    | Vocabulary feature          | Read-only deck list + deck detail pages, TanStack Query hooks, card count + due badge                        |
| 08    | Learning feature (HERO)     | Flashcard study session — front/back flip, 4-button rating, SM-2 update, session summary                     |
| 09    | Statistics + dashboard      | Streak, XP, level, GitHub-style heatmap, achievement badges, `useDashboardStats` hook                        |
| 10    | PWA + offline               | Serwist service worker, web app manifest, offline fallback page, push subscribe stub, install prompt         |
| 11    | Tests + perf gates          | 286+ unit/integration tests, Playwright e2e happy path, Lighthouse CI ≥95, bundle ≤200 KB gzip               |
| 12    | Docs + handoff              | README, codebase-summary, system-architecture, code-standards, design-guidelines, roadmap, changelog         |

## Test coverage

- **Unit tests:** SM-2 (calculate-next-review, stage-transitions, get-session-queue), gamification (XP, level, streak, achievements), storage (card-repo, user-card-repo, seed-loader), auth store, push subscribe
- **Integration tests:** login flow, app shell, vocabulary decks list/detail, flashcard flow, dashboard stats cards, heatmap rendering, online-status indicator
- **Architecture tests:** eslint-plugin-boundaries zero-violation check (`tests/architecture/boundaries.test.ts`)
- **E2E:** Playwright happy path — login → dashboard → 5-card study → streak +1 (`e2e/happy-path.spec.ts`)
- **SRS coverage:** ≥95% branches verified
- **Total:** 286+ tests across unit + integration

## File tree — `apps/lexio-web/`

```
apps/lexio-web/
├── app/                        # Next.js App Router pages
│   ├── (app)/                  # Authenticated route group
│   │   ├── dashboard/page.tsx  # Main dashboard
│   │   ├── decks/
│   │   │   ├── page.tsx        # Deck list
│   │   │   └── [id]/page.tsx   # Deck detail
│   │   ├── stats/page.tsx      # Statistics page
│   │   ├── study/
│   │   │   ├── new/page.tsx    # Start study session
│   │   │   └── [sessionId]/page.tsx  # Active session
│   │   └── layout.tsx          # App shell (sidebar + topbar)
│   ├── (auth)/
│   │   ├── login/page.tsx      # Stub login form
│   │   └── layout.tsx
│   ├── (showcase)/
│   │   └── design/page.tsx     # Design system showcase
│   ├── offline/page.tsx        # Serwist offline fallback
│   ├── layout.tsx              # Root layout (fonts, providers)
│   ├── manifest.ts             # PWA manifest
│   ├── page.tsx                # Root redirect → /dashboard
│   └── sw.ts                   # Serwist service worker entry
│
├── core/                       # Pure TS domain — zero React/Next/Dexie
│   ├── entities/               # Domain types
│   │   ├── card.ts             # Card entity
│   │   ├── deck.ts             # Deck entity
│   │   ├── review.ts           # Review record
│   │   ├── session.ts          # Study session
│   │   ├── user.ts             # User entity
│   │   ├── user-card.ts        # Per-user SM-2 state
│   │   ├── user-xp.ts          # XP + level state
│   │   ├── streak.ts           # Streak entity
│   │   └── achievement.ts      # Achievement entity
│   ├── ports/                  # Repository/service interfaces
│   │   ├── card-repository.ts
│   │   ├── deck-repository.ts
│   │   ├── user-card-repository.ts
│   │   ├── review-repository.ts
│   │   ├── session-repository.ts
│   │   ├── streak-repository.ts
│   │   ├── user-xp-repository.ts
│   │   ├── achievement-repository.ts
│   │   └── auth-service.ts
│   ├── schemas/                # Zod validation schemas
│   │   ├── card.schema.ts
│   │   ├── deck.schema.ts
│   │   ├── review.schema.ts
│   │   ├── user.schema.ts
│   │   └── user-card.schema.ts
│   └── use-cases/
│       ├── srs/                # SM-2 algorithm (pure TS)
│       │   ├── calculate-next-review.ts  # Main entry point
│       │   ├── ease-factor.ts            # EF update formula
│       │   ├── interval-calculator.ts    # Interval by stage
│       │   ├── stage-transitions.ts      # Stage state machine
│       │   └── get-session-queue.ts      # Due card selector
│       └── gamification/
│           ├── compute-xp.ts
│           ├── compute-level.ts
│           ├── update-streak.ts
│           └── check-achievements.ts
│
├── features/                   # Vertical slices — no cross-feature imports
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   └── require-auth.tsx
│   │   └── store/auth-store.ts # Zustand stub (NOT PROD)
│   ├── learning/
│   │   ├── components/         # Flashcard, RatingBar, SessionProgress, Summary
│   │   ├── hooks/              # useStudySession, useKeyboardShortcuts
│   │   ├── store/session-store.ts
│   │   ├── types/
│   │   └── use-cases/          # start-session, submit-review
│   ├── vocabulary/
│   │   ├── components/         # DeckCard, CardRow, DeckHeader
│   │   └── hooks/              # useDecks, useDeckDetail
│   ├── statistics/
│   │   ├── components/         # HeatmapGrid, StatCard, AchievementBadge
│   │   └── hooks/              # useDashboardStats, useHeatmap, useAchievements
│   └── notifications/
│       └── hooks/              # usePushSubscribe (stub)
│
├── lib/                        # Infrastructure adapters
│   ├── storage/
│   │   ├── db.ts               # Dexie DB instance + schema
│   │   ├── card-repository-dexie.ts
│   │   ├── user-card-repository-dexie.ts
│   │   ├── deck-repository-dexie.ts
│   │   ├── review-repository-dexie.ts
│   │   ├── session-repository-dexie.ts
│   │   ├── streak-repository-dexie.ts
│   │   ├── user-xp-repository-dexie.ts
│   │   ├── achievement-repository-dexie.ts
│   │   └── seed-loader.ts      # Loads seed-it-tech.json into Dexie
│   └── api/                    # Mock API stubs (swap for HTTP in v0.4)
│
├── shared/                     # Cross-cutting — no feature logic
│   ├── components/
│   │   ├── ui/                 # ShadCN primitives (button, card, badge…)
│   │   ├── layout/             # Sidebar, TopBar
│   │   ├── not-prod-banner.tsx # Prominent stub-auth warning
│   │   ├── offline-indicator.tsx
│   │   └── providers/          # QueryProvider, DbInitProvider, WebVitalsReporter
│   ├── fonts.ts                # next/font config (Inter, JetBrains Mono, Charis SIL)
│   ├── icons/index.ts          # Lucide canonical icon map (§12.7.2)
│   ├── hooks/use-online-status.ts
│   ├── lib/utils.ts            # cn() + shared helpers
│   ├── store/ui-store.ts       # Sidebar open/close
│   └── theme/theme-provider.tsx
│
├── i18n/                       # next-intl messages
├── e2e/happy-path.spec.ts      # Playwright end-to-end
├── tests/                      # Vitest unit + integration + arch
├── public/
│   ├── data/seed-it-tech.json  # 30 IT/Tech vocabulary cards
│   ├── fonts/                  # Self-hosted Charis SIL woff2
│   └── icons/                  # PWA icons (192px, 512px)
└── scripts/
```

## "Where to look for X" quick reference

| Concern                 | File                                                  |
| ----------------------- | ----------------------------------------------------- |
| SM-2 algorithm entry    | `core/use-cases/srs/calculate-next-review.ts`         |
| SRS stage state machine | `core/use-cases/srs/stage-transitions.ts`             |
| Due card queue selector | `core/use-cases/srs/get-session-queue.ts`             |
| Dexie DB schema         | `lib/storage/db.ts`                                   |
| Seed data               | `public/data/seed-it-tech.json`                       |
| Theme tokens (CSS vars) | `app/globals.css`                                     |
| Lucide icon map         | `shared/icons/index.ts`                               |
| Auth stub store         | `features/auth/store/auth-store.ts`                   |
| Flashcard study UI      | `features/learning/components/study-session.tsx`      |
| Dashboard stats         | `features/statistics/hooks/use-dashboard-stats.tsx`   |
| Heatmap                 | `features/statistics/components/` + `use-heatmap.tsx` |
| PWA manifest            | `app/manifest.ts`                                     |
| Service worker          | `app/sw.ts`                                           |
| Push subscribe stub     | `features/notifications/hooks/use-push-subscribe.ts`  |
| Architecture test       | `tests/architecture/boundaries.test.ts`               |

## What is NOT implemented

Explicit gaps for next iteration:

- Real auth (JWT, refresh tokens, OAuth) — Zustand stub only
- All .NET 10 backend services — folders are empty placeholders
- Free Dictionary API integration — no word lookup
- Deck CRUD UI — decks are read-only, seeded only
- Exercise types beyond flashcard (type-in, listening, multiple choice)
- Real push notification delivery — subscribe only, no server
- Vietnamese locale — `i18n/vi.json` scaffold, no translations
- Social features (follows, shared decks, leaderboards)
- AI content generation (Phase 2)
- Content moderation
- Payment integration

## Key architecture decisions

| Decision          | Choice                            | Rationale                                                               |
| ----------------- | --------------------------------- | ----------------------------------------------------------------------- |
| PWA library       | Serwist                           | Next 16 native support; `@ducanh2912/next-pwa` stale on Next 15+        |
| IPA font          | Charis SIL self-hosted woff2      | Google Fonts version incomplete for IPA range                           |
| Auth persistence  | Zustand `persist` → localStorage  | Dev convenience; swap for secure cookies in v0.2                        |
| Dexie index       | Compound `[userId+nextReviewAt]`  | Efficient due-card query; BRIN not applicable to IndexedDB              |
| SRS location      | `core/` pure TS use-case          | Portable to .NET 10 Learning service in v0.4 (algorithm reuse)          |
| Heatmap rendering | Client component + `next/dynamic` | SVG layout requires DOM; avoids SSR hydration mismatch                  |
| Tailwind          | v4 (CSS-first)                    | No `tailwind.config.ts`; tokens in `globals.css` `@theme` block         |
| i18n              | next-intl                         | App Router native; `useTranslations` hook in server + client components |

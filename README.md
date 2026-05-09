# Lexio

> Master vocabulary, the smart way.

Enterprise-grade vocabulary learning platform for IT/Tech professionals. SM-2 spaced repetition, gamification, PWA-first, microservices-ready.

## Status

**Phase 1 prototype — FE-only vertical slice.** Stub auth + Dexie/IndexedDB persistence + pure-TS SM-2 engine. Backend microservices (.NET 10) come next iteration.

> **NOT PRODUCTION.** Auth is a Zustand stub — no JWT, no real sessions. Do not deploy publicly.

**Hero flow working:** stub login → dashboard (due/streak/XP/heatmap) → flashcard study with 4-button rating → SM-2 schedules next review → stats update → session summary.

## Quickstart

**Prerequisites:** Node 20+, pnpm 9+, Git. Docker optional (backend services future iteration).

```bash
git clone git@github.com:bavanchun/lexio-FE.git
cd lexio-FE
pnpm install
pnpm --filter lexio-web dev
# open http://localhost:3000 — redirects to /login
```

Sign in with any email + display name. NOT real auth — see [system architecture](docs/system-architecture.md).

## Tech stack

| Layer            | Choice                                                                         |
| ---------------- | ------------------------------------------------------------------------------ |
| **Web**          | Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind v4 + ShadCN  |
| **State**        | Zustand + TanStack Query 5 + RHF + Zod                                         |
| **Persistence**  | Dexie.js (IndexedDB) — backend services come in next iteration                 |
| **PWA**          | Serwist (offline + manifest + push subscription stub)                          |
| **i18n**         | next-intl (English now, Vietnamese scaffold ready)                             |
| **Tests**        | Vitest + RTL + Playwright + Lighthouse CI                                      |
| **Architecture** | Clean Architecture (app/features/core/lib/shared) via eslint-plugin-boundaries |

## Repository layout

```
apps/
  lexio-web/        # Next.js 16 PWA — the prototype
services/
  identity/         # Reserved for .NET 10 (next iteration)
  vocabulary/
  learning/
  statistics/
  content/
  notification/
  social/
shared/             # Reserved for shared protos/contracts when BE lands
docs/               # Source of truth + technical docs
plans/              # Phase-by-phase implementation plans + reports
.github/            # CI workflows
```

## Scripts

```bash
pnpm --filter lexio-web dev          # dev server
pnpm --filter lexio-web build        # production build
pnpm --filter lexio-web test         # unit + integration
pnpm --filter lexio-web e2e          # Playwright happy path
pnpm --filter lexio-web coverage     # SRS engine coverage
pnpm --filter lexio-web lighthouse   # PWA + perf audit
pnpm validate                        # all of the above (fail-fast)
```

## What works in this prototype

- Stub login (any email + display name)
- Dashboard: due count, new cards, streak, XP level, GitHub-style activity heatmap
- Deck list + deck detail (read-only, 30 seeded IT/Tech cards)
- Flashcard study session — front/back flip, 4-button rating (Again/Hard/Good/Easy)
- SM-2 algorithm schedules next review after each rating
- Session summary with XP gained + streak update
- Dark mode first, light mode toggle
- PWA: installable, offline page via Serwist service worker
- Lighthouse ≥ 95 Perf/A11y/BP/SEO

## What is stubbed / not implemented

| Feature                    | Status        | Notes                               |
| -------------------------- | ------------- | ----------------------------------- |
| Real auth (JWT/OAuth)      | STUBBED       | Zustand-only, localStorage persist  |
| Push notification delivery | STUBBED       | Subscribe-only, no server           |
| .NET 10 backend services   | PLACEHOLDER   | Scaffold next iteration             |
| Free Dictionary lookup     | NOT STARTED   | v0.3 milestone                      |
| Deck CRUD UI               | NOT STARTED   | v0.3 milestone                      |
| Multi-exercise types       | NOT STARTED   | Type-in, listening planned          |
| Vietnamese locale          | SCAFFOLD ONLY | next-intl wired, translations empty |
| Social features            | NOT STARTED   | v0.6+ milestone                     |
| AI content generation      | NOT STARTED   | Phase 2                             |

## Architecture invariants

- `core/` is pure TS — zero React, zero Next, zero Dexie. Verified via eslint-plugin-boundaries.
- Repository ports in `core/ports/` — adapters in `lib/storage/` (Dexie now, REST/.NET later).
- Features never import other features — communicate via app-level state or shared utilities.
- ≤200 LOC per file (per CLAUDE.md modularization rule).
- Sentence case, no emoji in functional UI, no gradients, no glassmorphism (doc §12.5).

## Brand identity

Strict adherence to doc §12 minimal-pro aesthetic — Linear / Vercel / Stripe / Notion. Zinc + Indigo. Dark mode first. See [design guidelines](docs/design-guidelines.md).

## Documentation

| Doc                                                     | Purpose                                       |
| ------------------------------------------------------- | --------------------------------------------- |
| [codebase-summary.md](docs/codebase-summary.md)         | What's in the FE prototype today              |
| [system-architecture.md](docs/system-architecture.md)   | Current prototype + target microservices      |
| [code-standards.md](docs/code-standards.md)             | Clean Arch rules, naming, Git workflow        |
| [design-guidelines.md](docs/design-guidelines.md)       | Minimal-pro brand, Zinc + Indigo, 14 rules    |
| [development-roadmap.md](docs/development-roadmap.md)   | What's next (.NET 10, real auth, AI Phase 2+) |
| [project-changelog.md](docs/project-changelog.md)       | Phases 01–12 deliverables                     |
| [project-overview-pdr.md](docs/project-overview-pdr.md) | Product vision, personas, success metrics     |

**Single authoritative spec:** `docs/Lexio_Complete_Documentation.docx`

## Known limitations

1. IndexedDB data is per-browser, per-device. No sync yet.
2. Service worker requires HTTPS in production (localhost exempt).
3. VAPID keys are stubs — real push requires a server.
4. Charis SIL IPA font served from `/public/fonts/` — verify license for redistribution.
5. No CSP in dev mode; production CSP headers set in `next.config.ts`.
6. Lighthouse CI scores measured on production build, not dev server.

## License

Private — pre-public.

## Contributing

Trunk-based with stacked PRs. See [code-standards.md](docs/code-standards.md) → Git workflow protocol.

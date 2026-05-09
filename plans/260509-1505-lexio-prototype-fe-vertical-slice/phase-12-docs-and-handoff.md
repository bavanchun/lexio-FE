# Phase 12 — Docs & handoff

## Context links

- Doc §10 (roadmap), all prior phases
- Depends on: phase-11

## Overview

- **Priority:** P2
- **Status:** complete
- **Brief:** Update `./docs/codebase-summary.md`, `./docs/system-architecture.md`. Write quickstart `./README.md`. Document next-iteration TODOs (.NET 10 Identity scaffold first, then Free Dictionary integration, then real auth, etc.).

## Key insights

- Docs in `./docs` are the single source of truth for the project (per CLAUDE.md).
- Make explicit which doc-spec items are NOT yet implemented (auth, services, push delivery, deck CRUD, multi-exercise).
- Mark stub auth + push prominently.

## Requirements

**Functional:**

- `./README.md` quickstart: prereqs, install, dev, test, build commands; brief architecture diagram (ASCII or Mermaid); "what works in prototype" + "what's stubbed".
- `./docs/codebase-summary.md` — folder map + Clean Architecture explanation + key files index.
- `./docs/system-architecture.md` — current FE-only architecture + future microservices target.
- `./docs/project-changelog.md` — add v0.1.0 entry "Prototype FE vertical slice".
- `./docs/development-roadmap.md` — update status: "Phase 0 prototype — done". Next-iteration TODOs explicit.

## Related code files

**Create/Modify:**

- `./README.md` (create or replace)
- `./docs/codebase-summary.md` (create)
- `./docs/system-architecture.md` (create — FE only this iter; note future BE)
- `./docs/project-changelog.md` (create)
- `./docs/development-roadmap.md` (create)

## Implementation steps

1. README quickstart:
   - Prereqs: Node 20+, pnpm 9+, Docker Desktop (optional for postgres/redis stub).
   - `pnpm install && pnpm dev` from repo root + `apps/lexio-web`.
   - Default route: `/login` → "Continue as Learner" → `/dashboard`.
   - `pnpm validate` runs full gate.
   - "What works": stub login, dashboard stats/heatmap, deck list/detail (read-only), flashcard study with SM-2, summary, PWA offline, dark mode.
   - "What's stubbed": auth (no real JWT), push delivery, .NET services, Free Dictionary lookup, deck CRUD, exercise types beyond flashcard.
2. `codebase-summary.md`:
   - Tree of `apps/lexio-web/` with annotations.
   - Layer responsibilities (app/features/core/lib/shared) + dependency rule diagram.
   - "Where to look for X" table:
     | Concern | File |
     |--|--|
     | SM-2 algo | `core/use-cases/srs/calculate-next-review.ts` |
     | Dexie schema | `lib/storage/db.ts` |
     | Theme tokens | `app/globals.css` |
     | Icon mapping | `shared/icons/icon-map.ts` |
     | Auth stub | `features/auth/store/auth-store.ts` |
3. `system-architecture.md`:
   - "Current state — prototype FE-only" diagram (ASCII or Mermaid).
   - "Target state — 7 microservices on K8s" diagram + table from doc §6.3.
   - Migration path summary: Phase A) scaffold .NET 10 Identity service; Phase B) replace `lib/api/` mocks with HTTP calls; Phase C) move SRS engine to .NET Learning service (reuse algorithm).
4. `project-changelog.md`:
   ```
   ## v0.1.0 — Prototype FE vertical slice (2026-05-09)
   ### Added
   - Next.js 15 + React 19 + TS strict scaffold
   - Clean Architecture skeleton with eslint-plugin-boundaries
   - SM-2 SRS engine in pure TS, ≥95% coverage
   - Dexie persistence with seed (30 IT/Tech cards)
   - Stub auth + app shell (sidebar + topbar)
   - Flashcard study session with 4-button rating
   - Dashboard with streak + XP + GitHub-style heatmap
   - PWA via Serwist + offline page
   - E2E Playwright happy path + Lighthouse ≥95
   ### Stubbed
   - Auth (no JWT) — replace in v0.2.0
   - Push delivery (subscribe-only)
   ```
5. `development-roadmap.md`:
   - **v0.1 (DONE):** Prototype FE vertical slice
   - **v0.2 (NEXT):** Scaffold .NET 10 Identity service per doc §6.7.2-3; replace stub auth with real JWT/refresh.
   - **v0.3:** Vocabulary service (.NET 10) + Free Dictionary integration + deck CRUD UI.
   - **v0.4:** Learning service (.NET 10) — port SM-2 to C#; replace `lib/api/` stubs.
   - **v0.5:** Statistics service + Notification service.
   - **v0.6+:** Social, multi-exercise, content moderation, K8s deployment.
6. Add a "Known limitations" appendix to README.

## Todo

- [x] README quickstart
- [x] codebase-summary.md
- [x] system-architecture.md
- [x] project-changelog.md
- [x] development-roadmap.md (update with .NET 10 not 9)
- [x] Verify all internal links work
- [x] Self-review for grammar / concision

## Success criteria

- Fresh dev can clone repo and reach `/dashboard` in <5 min using only README.
- `./docs` lists all critical files & decisions.
- Roadmap explicitly cites .NET 10 (per user override).

## Risk assessment

| Risk                                        | Likelihood | Impact | Mitigation                                                 |
| ------------------------------------------- | ---------- | ------ | ---------------------------------------------------------- |
| Docs drift from code post-merge             | H          | M      | Add `docs-check` job in CI later (out of scope this iter)  |
| Stub auth misunderstood as production-ready | M          | H      | Bold "NOT PRODUCTION" in README + dev banner from phase-06 |

## Security considerations

- Document explicit non-prod stubs.
- Note CSP from phase-10.

## Next steps

Tag `v0.1.0`. Hand off to next iteration: start with `services/identity/` .NET 10 scaffold.

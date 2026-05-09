# Code standards — Lexio

> Concise reference. Source of truth for architectural rules, naming, git workflow, and testing gates.

## Clean architecture rules (FE)

### Layer dependency rule

```
app  →  features  →  lib  →  core
              ↓
            shared
              ↓
            core
```

- `core/` imports nothing from the project — pure TS only (no React, no Next, no Dexie)
- `features/X` never imports from `features/Y` — communicate via app-level store or shared utilities
- `lib/` implements `core/ports/` interfaces — no feature logic
- `shared/` has no feature or business logic — UI primitives, icons, utils only

### eslint-plugin-boundaries config

Boundaries are enforced in `eslint.config.js`. Any violation fails CI and the architecture test (`tests/architecture/boundaries.test.ts`).

```js
// Summary of zone rules
zones: [
  { from: 'app', allow: ['features', 'shared', 'lib', 'core'] },
  { from: 'features', allow: ['shared', 'lib', 'core'] },
  { from: 'lib', allow: ['core'] },
  { from: 'shared', allow: ['core'] },
  { from: 'core', allow: [] },
];
```

### BE placeholder (next iteration)

.NET 10 services in `services/` will follow Clean Architecture:

- `Domain/` — entities + domain events (mirrors `core/entities/`)
- `Application/` — use-cases + ports (interfaces)
- `Infrastructure/` — EF Core repos, HTTP clients, message bus adapters
- `API/` — ASP.NET Core minimal API / controllers

## File naming

| Rule                                                 | Example                                                  |
| ---------------------------------------------------- | -------------------------------------------------------- |
| JS/TS files: kebab-case                              | `calculate-next-review.ts`                               |
| React components: kebab-case file, PascalCase export | `flashcard-front.tsx` → `export function FlashcardFront` |
| Long descriptive names are fine                      | `user-card-repository-dexie.ts`                          |
| ≤200 LOC per file — split if exceeded                | see CLAUDE.md modularization rule                        |
| No barrel re-exports across layer boundaries         | each layer has `index.ts` for its own public API         |
| Test files mirror source path                        | `tests/unit/srs/calculate-next-review.test.ts`           |

## UI text

- **Sentence case** everywhere — headings, buttons, labels, toasts
- No emoji in functional UI (design showcase only)
- Copy via `next-intl` `useTranslations()` — no hardcoded English strings in components
- English locale: `i18n/en.json`

## Conventional commits

Format: `type(scope): description`

```
feat(web): add heatmap component
fix(srs): correct ease-factor floor at 1.3
test(web): add flashcard-flow integration test
refactor(learning): extract rating-bar into shared component
docs(repo): update codebase summary
chore(web): bump serwist to 9.1
ci(web): add bundle size gate
```

### Types

| Type       | When                                       |
| ---------- | ------------------------------------------ |
| `feat`     | New user-facing feature                    |
| `fix`      | Bug fix                                    |
| `refactor` | Code restructure, no behavior change       |
| `test`     | Test additions/changes                     |
| `docs`     | Documentation only                         |
| `ci`       | CI/CD pipeline changes                     |
| `chore`    | Tooling, deps, config (no production code) |
| `perf`     | Performance improvement                    |

### Rules

- Subject line ≤72 chars, imperative mood, no trailing period
- Scope = package or domain (`web`, `srs`, `learning`, `repo`, `ci`)
- No `chore` or `docs` for `.claude/` directory changes (per CLAUDE.md)
- Breaking changes: add `!` after type — `feat(api)!: remove legacy endpoint`

## Branch strategy

| Prefix      | Purpose              | Base branch                 |
| ----------- | -------------------- | --------------------------- |
| `feat/`     | New feature          | `main` or prior feat branch |
| `fix/`      | Bug fix              | `main`                      |
| `refactor/` | Refactor             | `main`                      |
| `test/`     | Test-only changes    | `main`                      |
| `docs/`     | Documentation        | `main` or prior feat branch |
| `chore/`    | Tooling/deps         | `main`                      |
| `hotfix/`   | Production emergency | `main`                      |

Naming: `feat/web-study-session-hero` — type + scope + short description, kebab-case.

## Stacked PR sequencing

When phases depend on prior unmerged PRs (as in this prototype), stack PRs:

```
PR #1: feat/web-clean-arch-skeleton          → base: main
PR #2: feat/web-srs-engine                   → base: feat/web-clean-arch-skeleton
PR #3: feat/web-dexie-persistence-and-seed   → base: feat/web-srs-engine
...
PR #9: feat/web-tests-and-perf-gates         → base: feat/web-statistics-dashboard
PR #10: docs/web-handoff-and-roadmap         → base: feat/web-tests-and-perf-gates
```

Merge bottom-up when ready. Each PR diff is small — only the delta from its base.

## Pre-commit gates

Run automatically via git hooks (husky / lefthook):

1. `eslint --max-warnings 0` — zero lint warnings
2. Prettier format check
3. `eslint-plugin-boundaries` — zero layer violations
4. No `console.log` in production code (lint rule)
5. No secrets / `.env` files staged (git-secrets / pre-commit hook)
6. Commitlint — conventional commit format

## Testing requirements

| Level                         | Tool                              | Gate                   |
| ----------------------------- | --------------------------------- | ---------------------- |
| Unit                          | Vitest                            | All pass               |
| Integration                   | Vitest + RTL                      | All pass               |
| Architecture                  | Vitest (eslint-plugin-boundaries) | Zero violations        |
| E2E                           | Playwright                        | Happy path passes      |
| Coverage (SRS + gamification) | Vitest `--coverage`               | ≥95% branches          |
| Performance                   | Lighthouse CI                     | Perf/A11y/BP/SEO ≥95   |
| Bundle size                   | `bundlesize` / CI check           | ≤200 KB gzip per route |

Run all gates: `pnpm validate`

### Test file conventions

- Unit tests: `tests/unit/{domain}/{file}.test.ts`
- Integration tests: `tests/integration/{feature}/{scenario}.test.tsx`
- Helpers/fixtures: `tests/unit/{domain}/helpers.ts`
- E2E: `e2e/{scenario}.spec.ts`
- No mocking of `core/` modules — they are pure TS and should run as-is
- Mock Dexie at `lib/storage/` boundary (fake-indexeddb)

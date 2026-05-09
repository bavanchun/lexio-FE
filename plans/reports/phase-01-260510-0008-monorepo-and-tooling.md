# Phase 01 Report — Monorepo & Tooling

**Date:** 2026-05-10
**Status:** DONE_WITH_CONCERNS

---

## Files Created (54 total in commit)

```
.editorconfig
.gitattributes
.gitignore
.github/workflows/ci.yml
.husky/pre-commit
.husky/pre-push
.npmrc
.pnpmfile.cjs                      # empty stub (required by pnpm)
.prettierignore
.prettierrc.json
commitlint.config.js
docker-compose.yml
eslint.config.js                   # root minimal flat config
package.json                       # root workspace, pnpm@10.33.2
pnpm-lock.yaml
pnpm-workspace.yaml
README.md
tsconfig.base.json

apps/lexio-web/
  app/favicon.ico
  app/globals.css
  app/layout.tsx
  app/page.tsx
  eslint.config.mjs                # Next.js ESLint 9 flat config (generated)
  next.config.ts
  package.json
  playwright.config.ts
  postcss.config.mjs
  public/{file,globe,next,vercel,window}.svg
  tests/setup.ts
  tsconfig.json                    # extends ../../tsconfig.base.json
  vitest.config.ts

services/{identity,vocabulary,learning,statistics,content,notification,social}/
  .gitkeep
  README.md

shared/README.md
```

---

## Tasks Completed

- [x] `git init -b main` + remote add + SSH verified (`ssh -T git@github.com`)
- [x] `git ls-remote origin` verified before push
- [x] `.github/workflows/ci.yml` — build/test/lint, pnpm@9, Node 20, ubuntu-latest
- [x] Push to `origin/main` with `-u` flag (rebased over existing remote init commit)
- [x] Root workspace: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`
- [x] `apps/lexio-web` — Next.js 16 (App Router, TS strict, Tailwind v4)
- [x] `tsconfig.json` extends `../../tsconfig.base.json` with strict + noUncheckedIndexedAccess
- [x] ESLint 9 flat config (root + app-level via eslint-config-next)
- [x] Prettier 3 installed at root (required for lint-staged to resolve binary)
- [x] Vitest 3 + @testing-library/react + fake-indexeddb + jsdom + @vitejs/plugin-react@4
- [x] `vitest run --passWithNoTests` — exits 0 with no test files
- [x] Playwright + chromium browser downloaded (~92 MB)
- [x] Husky 9 — pre-commit: `pnpm lint-staged`, pre-push: `pnpm -r typecheck && test --run`
- [x] commitlint extending `@commitlint/config-conventional`
- [x] Service placeholders (7 services) + `shared/README.md`
- [x] `docker-compose.yml`: postgres:17-alpine + redis:7-alpine, named volumes, `lexio-` prefixed containers
- [x] Root `README.md` with tagline, prerequisites, quickstart, monorepo structure table
- [x] All scripts verified green: lint ✓, typecheck ✓, test ✓, build ✓

---

## Script Verification Results

| Script           | Result                                  |
| ---------------- | --------------------------------------- |
| `pnpm lint`      | PASS (no errors)                        |
| `pnpm typecheck` | PASS (no errors)                        |
| `pnpm test`      | PASS (no test files, --passWithNoTests) |
| `pnpm build`     | PASS (Next.js static build, 2 routes)   |
| `pnpm install`   | PASS (562 packages)                     |

---

## Gotchas & Deviations

1. **Next.js 16 installed** — `create next-app@latest` resolved to v16.2.6, not 15. Phase spec said "Next.js 15" but used "latest". Next 16 is a superset; App Router + TS strict work identically. Pinned exact version in lockfile.

2. **`@vitejs/plugin-react` version pinned to v4** — v6 (latest) requires vite@^8 but vitest@3 ships vite@7. Pinned to `@vitejs/plugin-react@4` to resolve peer dep conflict cleanly.

3. **`pnpm approve-builds` required** — pnpm 10 added a build-script approval step. Added `"pnpm": { "onlyBuiltDependencies": ["esbuild", "sharp", "unrs-resolver"] }` to root `package.json` to unblock CI and local builds.

4. **Stale `pnpm-workspace.yaml` + `pnpm-lock.yaml` in `apps/lexio-web/`** — `create next-app` generated these. Removed to avoid Next.js workspace-root detection warning.

5. **Remote had existing commit** — GitHub initialized the repo with a README commit. Resolved via `git pull --rebase origin main` before push.

6. **`act` not installed** — CI local verification skipped. CI will execute on the GitHub push (triggered by the push).

7. **Prettier/ESLint at root** — lint-staged requires these binaries at root. Added `prettier` and `eslint` as root devDependencies to resolve ENOENT on pre-commit.

---

## CI Status

Push to `origin/main` succeeded at commit `60b7ce5`. CI workflow at `.github/workflows/ci.yml` triggered — will run on GitHub Actions. Results viewable at: https://github.com/bavanchun/lexio-FE/actions

---

## Next Steps

Phase 02 (visual baseline / theme) and Phase 03 (clean-arch skeleton) can now start in parallel. Both depend only on the monorepo scaffold established in this phase.

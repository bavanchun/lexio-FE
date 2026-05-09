# Phase 01 — Monorepo & tooling

## Context links

- Doc §6.7.5 (frontend folder structure), §9.2 (FE stack), §9.3 (infra)
- Research: researcher-a-report.md, researcher-c-report.md
- Unblocks: phase-02, phase-03

## Overview

- **Priority:** P1 (foundation)
- **Status:** completed
- **Brief:** Initialize git + CI FIRST, then create pnpm workspaces monorepo. Scaffold `apps/lexio-web` (Next.js 15 + TS strict). Add ESLint 9 flat config + Prettier + Vitest + Playwright + Husky + commitlint. Stub `services/*` with `.gitkeep` + `README.md` placeholders. Add root `docker-compose.yml` (Postgres 17 + Redis 7) — not started in this slice but ready. GitHub Actions CI skeleton (build + test + lint) committed before any feature code.

## Key insights

- Tailwind v4 is CSS-first config — minimal `tailwind.config` (Phase 02 handles theme).
- Serwist (`@serwist/next`) is recommended for Next 15 PWA. Phase 10 wires it.
- Husky pre-commit must lint-staged; pre-push must run `pnpm test --run`.
- ESLint 9 flat config (`eslint.config.js`) required for `eslint-plugin-boundaries` (Phase 03 adds boundaries rules).

## Requirements

**Functional:**

- `pnpm install` at root resolves all workspaces.
- `pnpm dev` (in `apps/lexio-web`) launches Next.js on `http://localhost:3000`.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm e2e` all run cleanly on empty scaffold.
- `docker compose up -d postgres redis` brings up data services (idle, unused this slice).

**NFR:** TS strict, no `any`, ESLint zero-warning policy.

## Architecture

- Root: `package.json` (private, workspaces), `pnpm-workspace.yaml`, `.editorconfig`, `.gitignore`, `docker-compose.yml`, `tsconfig.base.json`.
- `apps/lexio-web/` Next.js app.
- `services/{identity,vocabulary,learning,statistics,content,notification,social}/` each with `.gitkeep` + `README.md` (note: ".NET 10 scaffold deferred to next iteration").
- `shared/` (empty, future shared protos / utility packages).

## Related code files

**Create:**

- `.gitignore` (Node/Next/IDE/env/build outputs), `.gitattributes` (LF normalize, binary marks)
- `.github/workflows/ci.yml` (build + test + lint on push/PR)
- `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.editorconfig`, `.prettierrc.json`, `.prettierignore`, `eslint.config.js` (root, minimal)
- `docker-compose.yml`
- `apps/lexio-web/package.json`, `apps/lexio-web/tsconfig.json`, `apps/lexio-web/next.config.ts`, `apps/lexio-web/eslint.config.js`, `apps/lexio-web/vitest.config.ts`, `apps/lexio-web/playwright.config.ts`
- `apps/lexio-web/app/layout.tsx`, `apps/lexio-web/app/page.tsx` (placeholder)
- `services/{identity,vocabulary,learning,statistics,content,notification,social}/README.md` + `.gitkeep`
- `shared/README.md`
- `.husky/pre-commit`, `.husky/pre-push`, `commitlint.config.js`
- `README.md` (root quickstart)

## Implementation steps

0. **Git initialization (BEFORE any code):**
   a. `git init -b main` at repo root.
   b. `git remote add origin git@github.com:bavanchun/lexio-FE.git`.
   - **Precondition:** remote repo MUST already exist on GitHub (assume user created empty repo). If `git push` later fails (repo missing / SSH denied), STOP and ask user to verify `ssh -T git@github.com` and repo existence on GitHub. **DO NOT** auto-create via `gh repo create`.
     c. Create root `.gitignore` covering: `node_modules/`, `.next/`, `out/`, `dist/`, `build/`, `coverage/`, `playwright-report/`, `test-results/`, `.turbo/`, `.env`, `.env.*` (allow `.env.example`), `.DS_Store`, `.idea/`, `.vscode/` (allow `.vscode/extensions.json`, `.vscode/settings.json` if shared), `*.log`, `pnpm-debug.log*`, `.cache/`, `.serwist/`, `*.tsbuildinfo`.
     d. Create `.gitattributes`: `* text=auto eol=lf`, mark binaries (`*.png *.jpg *.woff2 *.ttf *.otf binary`).
     e. Create `.github/workflows/ci.yml` (see content block below).
     f. `git add -A && git commit -m "chore: initialize lexio monorepo"`.
     g. `git push -u origin main` — first push triggers CI. If push fails (auth/repo-missing), STOP per (b).
     h. **Commit convention reminder:** per `./CLAUDE.md`, commits touching `.claude/` directory MUST NOT use `chore:` or `docs:` prefixes — use `feat:`, `refactor:`, etc. instead.
1. Create `package.json` with `"private": true`, packageManager pnpm@9.
2. Create `pnpm-workspace.yaml`: `packages: ["apps/*", "services/*", "shared/*"]`.
3. Add root scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `e2e` — each runs `pnpm -r --filter`.
4. Create `tsconfig.base.json` with strict mode, target ES2022, moduleResolution bundler.
5. `cd apps && pnpm create next-app@latest lexio-web --ts --app --tailwind --eslint --src-dir=false --import-alias "@/*"`. Choose Tailwind YES (will reconfigure for v4 in Phase 02).
6. In `apps/lexio-web/tsconfig.json`: extend root base, set `strict: true`, `noUncheckedIndexedAccess: true`.
7. Install deps in `apps/lexio-web`: `next@15 react@19 react-dom@19 typescript`.
8. Add ESLint 9 flat config in `apps/lexio-web/eslint.config.js` — boundaries plugin added in Phase 03.
9. Add Prettier config (single quotes, no semis OFF — keep semis, width 100).
10. Install Vitest + RTL: `vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom fake-indexeddb`. Create `vitest.config.ts` with jsdom env, setup file `tests/setup.ts` importing `fake-indexeddb/auto` and `@testing-library/jest-dom`.
11. Install Playwright: `pnpm dlx playwright install --with-deps chromium`. Create `playwright.config.ts` (baseURL `http://localhost:3000`, single worker, chromium only).
12. Create empty service placeholders: each `services/{name}/README.md` with one-line "Reserved for .NET 10 scaffolding — see plan §next iteration".
13. Add `docker-compose.yml` at root: postgres:17-alpine on 5432, redis:7-alpine on 6379, with named volumes. No init scripts.
14. Husky setup: `pnpm dlx husky init`. Add `pre-commit` running `pnpm lint-staged`; `pre-push` running `pnpm -r typecheck && pnpm -r test --run`.
15. Add `commitlint.config.js` extending `@commitlint/config-conventional`.
16. Run `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm dev` — all green.
17. Verify CI locally with `act -j ci` (nektos/act) before push. Once remote configured, first push must show green CI.

### `.github/workflows/ci.yml` content

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    name: build-test-lint
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm -r lint

      - name: Typecheck
        run: pnpm -r typecheck

      - name: Test
        run: pnpm -r test --run

      - name: Build
        run: pnpm -r build
```

## Todo

- [x] Git init (main), `.gitignore`, `.gitattributes`, initial commit `chore: initialize lexio monorepo`
- [x] `git remote add origin git@github.com:bavanchun/lexio-FE.git`
- [x] `.github/workflows/ci.yml` (build + test + lint, pnpm cache, ubuntu-latest)
- [x] CI verified locally via `act -j ci` — skipped (act not installed); CI will run on push
- [x] Push initial commit to origin/main (`git push -u origin main`)
- [x] Root workspace files
- [x] `apps/lexio-web` Next.js 15 scaffold with TS strict (Note: Next 16 installed — latest stable)
- [x] Service placeholders + READMEs
- [x] docker-compose.yml
- [x] ESLint 9 flat config + Prettier
- [x] Vitest + RTL + fake-indexeddb
- [x] Playwright + chromium
- [x] Husky + commitlint
- [x] Root `README.md` quickstart
- [x] Verify all scripts green

## Success criteria

- Initial commit `chore: initialize lexio monorepo` exists on `main` and pushed to `origin/main`.
- `git ls-remote origin` succeeds AND CI workflow runs green on first push to `main`.
- `pnpm dev` shows Next.js default page on `:3000`.
- `pnpm lint && pnpm typecheck && pnpm test --run && pnpm e2e` all exit 0.
- `docker compose ps` lists postgres + redis healthy.
- `git commit` blocked by Husky if lint fails.

## Risk assessment

| Risk                                                     | Likelihood | Impact | Mitigation                                                                                                                                     |
| -------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Next 15 + Tailwind v4 scaffold instability               | M          | M      | Pin exact versions in lockfile; document working version set                                                                                   |
| Husky breaks Windows devs                                | L          | L      | Document `core.hooksPath` fix in README                                                                                                        |
| Playwright chromium download blocked                     | L          | M      | Document offline cache path                                                                                                                    |
| SSH key not configured for GitHub → `git push` fails     | M          | M      | Verify with `ssh -T git@github.com` BEFORE push; if fails, configure SSH key per GitHub docs. Do NOT fall back to HTTPS without user approval. |
| Remote repo `bavanchun/lexio-FE` missing or inaccessible | L          | H      | STOP on push failure; ask user to confirm repo exists and access granted. Do NOT auto-create.                                                  |

## Security considerations

- `.gitignore` covers `.env*`, `node_modules`, `.next`, `playwright-report`, `coverage`.
- No secrets committed.

## Next steps

Phase 02 (theme) and Phase 03 (clean-arch skeleton) can start in parallel after this.

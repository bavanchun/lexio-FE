# Phase 11 — Tests & perf gates

## Context links

- Doc §5.1 (perf targets), §5.5 (coverage targets)
- All prior phases
- Depends on: phase-04 through phase-10
- Unblocks: phase-12

## Overview

- **Priority:** P1
- **Status:** pending
- **Brief:** Lock testing pyramid: unit (Vitest, ≥80% on `core/`), integration (RTL on flashcard rating flow), E2E (Playwright happy path), Lighthouse CI ≥95 on critical routes, bundle analyzer with size budget.

## Key insights

- Phase 04 already covers SRS unit ≥95%. This phase fills out integration + E2E + perf gates.
- Lighthouse CI must run with prod build (`pnpm build && pnpm start`) not dev.
- Bundle analyzer output committed as artifact for review.

## Requirements

**Functional:**

- E2E happy path: open `/login` → "Continue as Learner" → `/dashboard` (due=30) → click "Start study" → flip + rate Good 5 times → land on summary → back to dashboard → streak shows 1 + heatmap cell colored.
- Integration: render `<Flashcard>` in test, simulate keyboard `Space` then `3` → expect SRS submit called with rating=3.
- Lighthouse on `/dashboard` and `/study` ≥95 perf/a11y/bp/seo (skip PWA on /study sub-route — covered in /dashboard).
- Bundle: any single route's gzipped JS < 200 KB.

**NFR:** All gates run in CI on PR.

## Architecture

- Tests folder structure already from phase-01:
  - `tests/unit/` Vitest
  - `tests/integration/` RTL
  - `tests/e2e/` Playwright
- New: `lighthouserc.js` at repo root, `.github/workflows/ci.yml` (or note for later if no GH actions yet).
- Bundle analyzer via `@next/bundle-analyzer`.

## Related code files

**Create:**

- `apps/lexio-web/tests/e2e/happy-path.spec.ts`
- `apps/lexio-web/tests/e2e/fixtures/seed-helpers.ts` (clear IndexedDB before run)
- `apps/lexio-web/tests/integration/learning/flashcard-rating-flow.test.tsx` (extend phase-08 test)
- `apps/lexio-web/lighthouserc.js`
- `apps/lexio-web/lib/tracking/web-vitals.ts`
- `apps/lexio-web/.github/workflows/ci.yml` (or root)
- `apps/lexio-web/scripts/check-bundle-size.mjs`

**Modify:**

- `apps/lexio-web/next.config.ts` (bundle analyzer wrap)
- `apps/lexio-web/app/layout.tsx` (call `reportWebVitals` via `useReportWebVitals` from next/web-vitals)

## Implementation steps

1. `pnpm add -D @next/bundle-analyzer @lhci/cli`.
2. Wrap next config with bundle analyzer (gated by `ANALYZE=true`). `pnpm analyze` script.
3. Add `web-vitals.ts` reporting CLS/LCP/FID/INP to console (later: real endpoint).
4. Configure `lighthouserc.js`:
   ```js
   module.exports = {
     ci: {
       collect: {
         staticDistDir: undefined,
         url: ['http://localhost:3000/dashboard', 'http://localhost:3000/login'],
         numberOfRuns: 3,
         startServerCommand: 'pnpm start',
       },
       assert: {
         assertions: {
           'categories:performance': ['error', { minScore: 0.95 }],
           'categories:accessibility': ['error', { minScore: 0.95 }],
           'categories:best-practices': ['error', { minScore: 0.95 }],
           'categories:seo': ['error', { minScore: 0.95 }],
         },
       },
       upload: { target: 'temporary-public-storage' },
     },
   };
   ```
5. `check-bundle-size.mjs` — read `.next/build-manifest.json` + per-route stats, fail if any route exceeds 200 KB gzip.
6. Write E2E happy-path:
   ```ts
   test('hero flow', async ({ page, context }) => {
     await context.clearCookies();
     await page.goto('/login');
     await page.getByRole('button', { name: /continue as learner/i }).click();
     await expect(page).toHaveURL(/\/dashboard/);
     await expect(page.getByText(/due today/i)).toBeVisible();
     await page.getByRole('link', { name: /start study/i }).click();
     for (let i = 0; i < 5; i++) {
       await page.keyboard.press('Space');
       await page.keyboard.press('3');
     }
     await expect(page.getByText(/session summary/i)).toBeVisible();
     await page.getByRole('link', { name: /back to dashboard/i }).click();
     await expect(page.getByText(/1 day streak/i)).toBeVisible();
   });
   ```
7. CI workflow:
   ```yaml
   jobs:
     verify:
       runs-on: ubuntu-latest
       steps:
         - checkout, setup-node, setup-pnpm
         - pnpm install --frozen-lockfile
         - pnpm lint && pnpm typecheck
         - pnpm test --run --coverage
         - pnpm build
         - pnpm exec playwright install --with-deps chromium
         - pnpm e2e
         - node scripts/check-bundle-size.mjs
         - pnpm dlx @lhci/cli autorun
   ```
8. Document local commands in README: `pnpm validate` = `pnpm lint && pnpm typecheck && pnpm test --run && pnpm e2e`.

## Todo

- [ ] @next/bundle-analyzer wired
- [ ] check-bundle-size.mjs gate (200 KB)
- [ ] web-vitals reporter
- [ ] Lighthouse CI config
- [ ] E2E happy-path spec
- [ ] Integration test for flashcard flow
- [ ] CI workflow file
- [ ] Local `pnpm validate` script

## Success criteria

- All CI jobs green.
- Coverage report shows core/use-cases/srs ≥95% branches.
- E2E happy path passes 3 consecutive runs.
- Lighthouse ≥95 across all 4 categories on `/dashboard`.
- No route exceeds 200 KB gzipped.

## Risk assessment

| Risk                                  | Likelihood | Impact | Mitigation                                                    |
| ------------------------------------- | ---------- | ------ | ------------------------------------------------------------- |
| Lighthouse flake (single-run noise)   | H          | M      | numberOfRuns: 3, take median                                  |
| E2E flake on Dexie init race          | M          | M      | Wait for `data-testid="db-ready"` selector before interaction |
| Bundle size regression on deps update | M          | M      | Bundle gate in CI; analyzer artifact uploaded                 |

## Security considerations

- Test data uses fixed UUIDs, no PII.
- E2E does not commit secrets (no `.env` consumed).

## Next steps

Phase 12 documentation closure.

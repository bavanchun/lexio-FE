# Phase 03 — Clean architecture skeleton

## Context links

- Doc §6.7.4-8 (FE Clean Architecture, dependency rules, eslint-plugin-boundaries)
- Doc §4.2 (card schema), §7.2 (DB tables for entity shapes)
- Research: researcher-a-report.md
- Depends on: phase-01
- Unblocks: phase-04, phase-05, phase-06

## Overview

- **Priority:** P1
- **Status:** completed
- **Brief:** Establish `app/`, `features/`, `core/`, `lib/`, `shared/` layout with eslint-plugin-boundaries enforcement. Define core entities, Zod schemas, and port interfaces. Scaffold next-intl (en locale only).

## Key insights

- `core/` MUST be pure TS — no React, Next, Dexie imports. Verify by `tsc --noEmit` on core only with no DOM lib.
- `features/*` cannot cross-import each other. Use core ports + shared store/events for cross-feature concerns.
- Boundaries plugin needs flat-config form — see doc §6.7.7.
- next-intl with App Router: `app/[locale]/` route segment OR `next-intl/middleware`. Prototype uses single locale (en), so a simple `IntlProvider` in app shell suffices. Structure ready for VI later.

## Requirements

**Functional:**

- Folder structure exactly per doc §6.7.5.
- ESLint fails build on cross-layer imports.
- Each `features/<name>/index.ts` is the public barrel — feature internals not importable externally (enforced by boundaries pattern).
- All entity shapes defined as TS types in `core/entities/` and Zod schemas in `core/schemas/`.
- Locale messages JSON at `apps/lexio-web/lib/i18n/messages/en.json`.

## Architecture

```
apps/lexio-web/
├── app/                # Next.js routes only
├── features/{auth,vocabulary,learning,statistics}/
│   ├── components/
│   ├── hooks/
│   ├── store/          # Zustand
│   ├── services/       # TanStack Query wrappers
│   ├── types/
│   └── index.ts        # Public barrel
├── core/
│   ├── entities/       # Card, Deck, UserCard, Review, User, Session, Streak, UserXp, Achievement
│   ├── use-cases/      # (filled by phase 04+)
│   ├── ports/          # IUserCardRepository, ICardRepository, IDeckRepository, ISessionRepository, IReviewRepository, IStatsRepository, IAuthService
│   └── schemas/        # Zod
├── lib/
│   ├── api/            # mock API gateway (phase 05 adds impl)
│   ├── storage/        # Dexie (phase 05)
│   ├── i18n/           # next-intl config + messages
│   ├── tracking/       # Web Vitals (phase 11)
│   └── utils/
└── shared/
    ├── components/ui/  # ShadCN (phase 02)
    ├── components/layout/
    ├── hooks/
    └── constants/
```

## Related code files

**Create:**

- `apps/lexio-web/eslint.config.js` (UPDATE — add eslint-plugin-boundaries)
- `apps/lexio-web/core/entities/{card,deck,user-card,review,user,session,streak,user-xp,achievement}.ts`
- `apps/lexio-web/core/schemas/{card,deck,user-card,review,user}.schema.ts`
- `apps/lexio-web/core/ports/{user-card-repository,card-repository,deck-repository,session-repository,review-repository,stats-repository,auth-service}.ts`
- `apps/lexio-web/features/auth/index.ts` (empty barrel)
- `apps/lexio-web/features/vocabulary/index.ts`
- `apps/lexio-web/features/learning/index.ts`
- `apps/lexio-web/features/statistics/index.ts`
- `apps/lexio-web/lib/i18n/{config,request,messages/en.json}.ts`
- `apps/lexio-web/lib/api/index.ts` (placeholder)
- `apps/lexio-web/lib/utils/cn.ts` (re-export)

## Implementation steps

1. Install: `pnpm add -D eslint-plugin-boundaries`. `pnpm add zod next-intl`.
2. Update `eslint.config.js` per doc §6.7.7:
   ```js
   import boundaries from 'eslint-plugin-boundaries';
   export default [
     // ... base configs
     {
       plugins: { boundaries },
       settings: {
         'boundaries/elements': [
           { type: 'app', pattern: 'app/**' },
           { type: 'features', pattern: 'features/**' },
           { type: 'core', pattern: 'core/**' },
           { type: 'lib', pattern: 'lib/**' },
           { type: 'shared', pattern: 'shared/**' },
         ],
       },
       rules: {
         'boundaries/element-types': [
           'error',
           {
             default: 'disallow',
             rules: [
               { from: 'app', allow: ['features', 'shared'] },
               { from: 'features', allow: ['core', 'shared', 'lib'] },
               { from: 'core', allow: [] },
               { from: 'lib', allow: ['core'] },
               { from: 'shared', allow: ['shared'] },
             ],
           },
         ],
         'boundaries/no-private': ['error'], // enforce barrel access
       },
     },
   ];
   ```
3. Define entities in `core/entities/`. Mirror doc §4.2 + §7.2:
   - `Card` (all 16 fields per §4.2; audio URLs nullable)
   - `Deck` (id, ownerId, title, description, visibility, cloneCount, createdAt)
   - `UserCard` (id, userId, cardId, deckId, stage, easeFactor, intervalDays, intervalMinutes?, repetitions, lapses, consecutiveGoods, nextReviewAt, isFavorite, personalNote, createdAt, updatedAt)
   - `Session` (id, userId, deckId?, startedAt, endedAt?, cardsReviewed, newCards)
   - `Review` (id, userCardId, sessionId, rating, durationMs, exerciseType, reviewedAt)
   - `Streak` (userId, currentStreak, longestStreak, lastActiveDate, heatmapData: Record<isoDate, number>)
   - `UserXp` (userId, totalXp, level, xpToNext)
   - `Achievement` (id, userId, badgeCode, earnedAt)
   - `User` (id, email, displayName, role: 'Learner', isVerified)
4. Mirror with Zod schemas in `core/schemas/`. Export `parseXxx` helpers.
5. Define ports as TS interfaces. Repositories return Promises of plain entity objects. No Dexie types leak in.
6. Create empty barrel files for each feature.
7. Wire next-intl minimal: `lib/i18n/config.ts` exports `locales = ['en']`, `defaultLocale = 'en'`. `lib/i18n/messages/en.json` seeded with stub keys (`app.title`, `nav.dashboard`, etc.). Wrap app shell with `NextIntlClientProvider` in Phase 06.
8. Add CI script `pnpm lint:boundaries` (alias for ESLint with `--max-warnings 0`).
9. Add a forbidden-import test under `tests/architecture/`: write a tiny script that attempts `import { db } from '../../lib/storage/db'` from a `core/` test file and expects ESLint to fail; doubles as documentation.

## Todo

- [x] eslint-plugin-boundaries config
- [x] All `core/entities/*.ts`
- [x] All `core/schemas/*.ts`
- [x] All `core/ports/*.ts`
- [x] feature barrel files
- [x] next-intl scaffolding (en only)
- [x] CI lint:boundaries script
- [x] Architecture violation test

## Success criteria

- `pnpm lint` exits 0 on clean skeleton.
- Adding `import { db } from '@/lib/storage/db'` in any `core/` file makes lint fail.
- `tsc --noEmit` clean on `core/` with `lib: ['ES2022']` only (no `dom`).

## Risk assessment

| Risk                                                        | Likelihood | Impact | Mitigation                                                                                 |
| ----------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------ |
| Boundaries plugin matches paths incorrectly with workspaces | M          | M      | Verify `pattern: 'features/**'` resolves vs `apps/lexio-web/features/**`; use cwd-relative |
| Type drift between entity TS and Zod schema                 | M          | M      | Use `z.infer<typeof CardSchema>` to derive types from schemas (single source of truth)     |

## Security considerations

- Zod schemas on every external boundary (later: HTTP responses). Now: validate seed JSON on load (Phase 05).

## Next steps

- Phase 04 (SRS engine) builds on `core/entities/UserCard` + `core/schemas`.
- Phase 05 (Dexie repos) implements ports.
- Phase 06 (shell) lays out routes per `app/` layer.

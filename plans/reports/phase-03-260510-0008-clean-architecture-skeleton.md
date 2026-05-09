# Phase 03 Implementation Report — Clean Architecture Skeleton

## Phase Implementation Report

### Executed Phase

- Phase: phase-03-clean-architecture-skeleton
- Plan: plans/260509-1505-lexio-prototype-fe-vertical-slice/
- Status: completed
- Branch: feat/web-clean-arch-skeleton
- PR: https://github.com/bavanchun/lexio-FE/pull/1

---

### Files Modified / Created

**core/ (new — 25 files)**

```
core/
├── entities/
│   ├── achievement.ts        (AchievementId, Achievement)
│   ├── card.ts               (CardId, DeckId, CefrLevel, ExerciseType, Card — 16 fields)
│   ├── deck.ts               (Visibility, Deck)
│   ├── review.ts             (ReviewId, SessionId, Rating, Review)
│   ├── session.ts            (Session)
│   ├── streak.ts             (Streak with heatmapData)
│   ├── user-card.ts          (UserCardId, Stage, UserCard)
│   ├── user-xp.ts            (UserXp)
│   └── user.ts               (UserId, Role, User)
├── ports/
│   ├── achievement-repository.ts   (IAchievementRepository)
│   ├── auth-service.ts             (IAuthService)
│   ├── card-repository.ts          (ICardRepository + CardSearchQuery)
│   ├── deck-repository.ts          (IDeckRepository)
│   ├── review-repository.ts        (IReviewRepository)
│   ├── session-repository.ts       (ISessionRepository)
│   ├── streak-repository.ts        (IStreakRepository)
│   ├── user-card-repository.ts     (IUserCardRepository)
│   └── user-xp-repository.ts      (IUserXpRepository)
├── schemas/
│   ├── card.schema.ts        (CardSchema + parseCard/safeParseCard)
│   ├── deck.schema.ts        (DeckSchema)
│   ├── review.schema.ts      (ReviewSchema, RatingSchema)
│   ├── user-card.schema.ts   (UserCardSchema, StageSchema)
│   └── user.schema.ts        (UserSchema, RoleSchema)
└── index.ts                  (barrel — all entities + schemas + ports)
```

**features/ (new — 12 files)**

```
features/{auth,vocabulary,learning,statistics}/
├── index.ts     (empty barrel, public API gate)
├── README.md    (scope, layers, dependencies)
└── {components,hooks,services,store,types}/  (empty dirs)
```

**lib/ (new — 8 files)**

```
lib/
├── api/index.ts       (placeholder)
├── storage/index.ts   (placeholder)
├── push/index.ts      (placeholder)
├── tracking/index.ts  (placeholder)
├── utils/index.ts     (placeholder, ClassValue re-export)
└── i18n/
    ├── locale.ts             (locales=['en'], defaultLocale)
    ├── request.ts            (duplicate — superseded by i18n/request.ts at root)
    └── messages/en.json      (~30 keys: app, nav, common, study, dashboard, design)
```

**i18n/ (new)**

- `i18n/request.ts` — next-intl v4 getRequestConfig, loads en.json per request

**Modified existing files**

- `apps/lexio-web/next.config.ts` — added createNextIntlPlugin
- `apps/lexio-web/app/layout.tsx` — added NextIntlClientProvider, getLocale/getMessages
- `apps/lexio-web/app/(showcase)/design/page.tsx` — uses getTranslations('design') for title/subtitle
- `apps/lexio-web/shared/fonts.ts` — added charisSil via next/font/local
- `apps/lexio-web/eslint.config.mjs` — added boundaries/dependencies rule
- `apps/lexio-web/tsconfig.json` — granular @/app/_, @/features/_, @/core/_, @/lib/_, @/shared/\* aliases
- `apps/lexio-web/package.json` — added lint:boundaries script

**New public assets**

- `apps/lexio-web/public/fonts/CharisSIL-Regular.woff2` (293 KB, SIL OFL 1.1)

**New tests**

- `apps/lexio-web/tests/architecture/boundaries.test.ts` (5 tests)

---

### Tasks Completed

- [x] eslint-plugin-boundaries config (v6, boundaries/dependencies rule)
- [x] All core/entities/\*.ts (9 entities with branded types)
- [x] All core/schemas/\*.ts (5 Zod schemas with parse helpers)
- [x] All core/ports/\*.ts (9 port interfaces)
- [x] Feature barrel files + READMEs + empty sub-folders
- [x] next-intl v4 scaffolding (en locale, 30 starter keys)
- [x] lint:boundaries script in package.json
- [x] Architecture violation tests (5 tests, all passing)
- [x] Charis SIL woff2 self-hosted, --font-ipa wired
- [x] /design page validates next-intl via getTranslations('design')
- [x] Phase-03 todos checked off in phase file

---

### Tests Status

- Type check: PASS (tsc --noEmit clean)
- Unit tests: PASS (5/5 architecture boundary tests)
- Integration tests: N/A (pure scaffolding phase)
- Build: PASS (next build clean, /design static)

### ESLint Boundaries Verification

```
pnpm --filter lexio-web lint → exit 0, 0 violations

Verified forbidden imports (caught by rule):
  core/ → lib/storage   ✓ error: boundaries/dependencies
  core/ → features/     ✓ error: boundaries/dependencies
  lib/  → features/     ✓ error: boundaries/dependencies
  features/ → features/ ✓ error: boundaries/dependencies (via checkInternals:true)

Verified allowed imports (pass lint):
  features/ → core/     ✓ exit 0
```

### IPA Font Confirmation

CharisSIL-Regular.woff2 (293 KB) extracted from official SIL zip (v6.200).
Loaded via `next/font/local` in shared/fonts.ts, exported as `charisSil` with
`variable: '--font-ipa'`. Applied to `<html>` className in app/layout.tsx.
IPA sample on /design page (`/ˈleksiˌoʊ/`) now renders with Charis SIL glyphs.

---

### Commits (4 atomic)

1. `feat(web): scaffold clean architecture folders with barrel exports`
2. `feat(web): wire next-intl with english locale scaffold`
3. `feat(web): self-host charis sil for ipa rendering`
4. `chore(web): enforce clean architecture with eslint-plugin-boundaries`

---

### Issues Encountered / Deviations

1. **eslint-plugin-boundaries v6 breaking changes**: Rule renamed from `element-types` to `dependencies`; legacy array selector syntax still works for `allow` but not reliably for `disallow` rules. Resolved by using `checkInternals: true` option (default `false`) to enable same-type import checking, then allowing intra-layer imports (`core→core`, `app→app`, `lib→lib`) while leaving `features→features` forbidden by `default: 'disallow'`.

2. **`lib/utils/index.ts` boundary conflict**: Re-exporting `cn` from `@/shared/lib/utils` caused boundaries plugin to classify it as `lib→lib` (since `shared/lib/utils` resolves as `lib/**` after alias). Fixed by removing the cn re-export from `lib/utils/index.ts` — lib adapters should import `@/shared/lib/utils` directly.

3. **next-intl v4 config location**: Placed at `i18n/request.ts` (app root) per v4 without-i18n-routing convention. The `lib/i18n/request.ts` file also exists as a duplicate — it's not referenced and can be cleaned in a follow-up.

4. **Phase spec referenced `phase-09` for Charis SIL**: Phase file originally deferred font to phase-09. This phase spec explicitly includes it, so it was implemented now. Fonts.ts comments updated accordingly.

---

### Next Steps (unblocked by this phase)

- Phase 04 (SRS engine): builds on `core/entities/user-card.ts` + `core/schemas/user-card.schema.ts` + `core/ports/user-card-repository.ts`
- Phase 05 (Dexie repos): implements all `core/ports/*.ts` interfaces in `lib/storage/`
- Phase 06 (shell routes): builds `app/` routes using `features/*/index.ts` barrels

---

### Unresolved Questions

- `lib/i18n/request.ts` is a duplicate of `i18n/request.ts` at root — only the root one is wired via next.config.ts plugin. The lib/ version is inert. Should it be deleted? (low priority — no impact on build)

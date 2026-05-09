# Phase 06 — Auth stub + app shell

## Context links

- Doc §6.7.5 (route groups), §12.7.2 (sidebar icons)
- Depends on: phase-02 (theme), phase-03 (skeleton)
- Unblocks: phase-07, phase-08, phase-09

## Overview

- **Priority:** P1
- **Status:** complete
- **Brief:** Local Zustand auth store (NOT PRODUCTION). Login page accepts any email/password and creates fake user with role=Learner. App shell layout with sidebar (Lucide canonical icons) + top bar (theme toggle + user menu). Route groups `(auth)` and `(app)`.

## Key insights

- Stub auth: a single button "Continue as Learner" + optional name input. No password validation. Persist via Zustand `persist` middleware (localStorage).
- All "(app)" routes redirect to `/login` if no user. Implemented client-side via a `<RequireAuth>` wrapper — no Next.js middleware (KISS).
- Sidebar collapse state via Zustand UI store.
- Mark stub clearly: red banner "DEV / NON-PROD STUB AUTH" in dev mode.

## Requirements

**Functional:**

- `/login` page renders with brand wordmark + "Continue as Learner" button.
- Submitting creates `User { id: uuid, email, displayName, role: 'Learner', isVerified: false }` in Zustand + localStorage. Also upsert into Dexie `users` table or stash in `meta` (KISS — keep in Zustand persist only).
- After login → redirect to `/dashboard`.
- Sidebar: Dashboard / Decks / Study / Stats / Achievements (placeholder route) / Settings (placeholder) / Sign out.
- Top bar: Lexio wordmark, theme toggle, avatar with initials.
- Sign out clears Zustand + localStorage, redirects to `/login`.
- Route guard on all `(app)/*` routes.

**NFR:** Initial layout JS < 50 KB.

## Architecture

```
app/
├── layout.tsx               # root: fonts, ThemeProvider, IntlProvider, ReactQueryProvider, DbInitGate
├── (auth)/
│   ├── layout.tsx           # centered card layout
│   └── login/page.tsx
└── (app)/
    ├── layout.tsx           # AppShell (sidebar + topbar + RequireAuth wrapper)
    ├── dashboard/page.tsx   # phase 09
    ├── decks/page.tsx       # phase 07
    ├── decks/[deckId]/page.tsx
    ├── study/[sessionId]/page.tsx  # phase 08
    └── stats/page.tsx       # phase 09 (alias of dashboard or detailed)
```

Stores:

- `features/auth/store/auth-store.ts` — `{ user, login, logout, isAuthenticated }` with `persist`.
- `shared/store/ui-store.ts` — `{ sidebarCollapsed, toggleSidebar }`.

## Related code files

**Create:**

- `apps/lexio-web/app/layout.tsx` (UPDATE from phase-02 — add ReactQueryProvider, IntlProvider, DbInitGate)
- `apps/lexio-web/app/(auth)/layout.tsx`
- `apps/lexio-web/app/(auth)/login/page.tsx`
- `apps/lexio-web/app/(app)/layout.tsx`
- `apps/lexio-web/app/(app)/dashboard/page.tsx` (placeholder until phase 09)
- `apps/lexio-web/features/auth/store/auth-store.ts`
- `apps/lexio-web/features/auth/components/login-form.tsx`
- `apps/lexio-web/features/auth/components/require-auth.tsx`
- `apps/lexio-web/features/auth/index.ts` (barrel)
- `apps/lexio-web/shared/components/layout/app-shell.tsx`
- `apps/lexio-web/shared/components/layout/sidebar.tsx`
- `apps/lexio-web/shared/components/layout/top-bar.tsx`
- `apps/lexio-web/shared/components/layout/dev-stub-banner.tsx`
- `apps/lexio-web/shared/components/providers/react-query-provider.tsx`
- `apps/lexio-web/shared/components/providers/intl-provider.tsx`
- `apps/lexio-web/shared/components/providers/db-init-gate.tsx`
- `apps/lexio-web/shared/store/ui-store.ts`

## Implementation steps

1. `pnpm add zustand`.
2. Create `auth-store.ts` with `persist` middleware (key `lexio-auth`). Export `useAuth()` hook.
3. Create `ReactQueryProvider` (default config: staleTime 60s, retry 1, suspense off).
4. Create `IntlProvider` reading from `lib/i18n/messages/en.json`.
5. Create `DbInitGate` — runs `db-init` (phase 05) inside `useEffect`, renders a Skeleton until ready.
6. Build `(auth)/login/page.tsx` — centered card, single button "Continue as Learner" + optional `displayName` input. Lucide `LogIn` icon. Submit → `auth.login({ id: uuid(), email: 'demo@lexio.app', displayName, role: 'Learner', isVerified: false })` → router.push('/dashboard').
7. Build `RequireAuth` — reads auth store. If `!isAuthenticated`, redirect to `/login` via `useRouter` in effect. Returns `null` during redirect.
8. Build `AppShell` with `<Sidebar />` + `<TopBar />` + main content. Wrap with `RequireAuth`.
9. `Sidebar` renders nav items using canonical icons from `shared/icons/icon-map.ts`. Active route via `usePathname()`. Collapsible via `ui-store`.
10. `TopBar` renders wordmark left, ThemeToggle right, Avatar with initials right. Sign-out menu via ShadCN DropdownMenu.
11. `DevStubBanner` — visible only when `process.env.NODE_ENV === 'development'`. Red bg, "DEV STUB AUTH — NOT PRODUCTION".
12. Code comment block at top of `auth-store.ts`:
    ```ts
    // ⚠️ NOT PRODUCTION — local Zustand-persisted user object only.
    // Replace with real JWT/refresh-token flow against Identity service in next iteration.
    ```

## Todo

- [x] auth-store with persist
- [x] login page + form
- [x] RequireAuth guard
- [x] AppShell + Sidebar + TopBar with canonical icons
- [x] ReactQueryProvider, IntlProvider, DbInitGate
- [x] DevStubBanner (NotProdBanner)
- [x] Sign-out flow
- [ ] Manual smoke: login → /dashboard → reload persists session → sign out → redirected to /login

## Success criteria

- `/login` → "Continue as Learner" → `/dashboard` works.
- Reload preserves auth (persist middleware).
- Sign out clears localStorage and redirects.
- Sidebar nav uses ONLY canonical icons from §12.7.2.
- ESLint boundaries: `app/` imports only from `features/` and `shared/`.

## Risk assessment

| Risk                                               | Likelihood | Impact | Mitigation                                                       |
| -------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------- |
| User forgets stub is non-production                | M          | H      | DevStubBanner + code header comments + plan-doc note             |
| Hydration mismatch from persist (server vs client) | M          | M      | `useHasHydrated` pattern; render Skeleton until rehydrated       |
| Route group layout misnesting                      | L          | M      | Verify by URL: `/login` → auth layout; `/dashboard` → app layout |

## Security considerations

- **NOT PRODUCTION.** No JWT, no rotation, no httpOnly. Trivially bypassable. Document loudly.
- No XSS — `displayName` rendered via React (auto-escaped); never `dangerouslySetInnerHTML`.
- CSP added in Phase 10.

## Next steps

Phase 07/08/09 build feature pages inside `(app)/`.

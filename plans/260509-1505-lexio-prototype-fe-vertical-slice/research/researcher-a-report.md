# Researcher A — Next.js 15 + React 19 + ShadCN + Tailwind 4 best practices

## Scope

App Router patterns for a PWA SPA-like app, RSC vs Client boundary, ShadCN install with Tailwind v4, font loading strategy, dark-mode wiring.

## Next.js 15 + React 19

- App Router is mandatory. Routes under `app/`. Use route groups `(auth)` and `(app)` to share layouts without affecting URL.
- For an offline-first PWA backed by Dexie, treat almost all routes as **Client Components**. Mark with `"use client"` at the route page top OR push interactivity into a feature component imported by an RSC page (preferred — keeps initial HTML small).
- React 19: `use()` hook for promises, `useActionState` for form actions, ref-as-prop (no `forwardRef` needed). Server Actions exist but **DO NOT use** in this slice — there's no server backend; data lives in IndexedDB.
- Avoid Server Actions and dynamic = "force-dynamic" — instead `dynamic = "force-static"` or default static rendering, hydrate Dexie on client.
- `next.config.ts` (TS supported in 15). Set `reactStrictMode: true`, `experimental.typedRoutes: true`.
- Turbopack is dev default in 15. Keep webpack for production unless next-pwa requires switch (next-pwa is webpack-only — see Researcher C).

## RSC vs Client boundary (KISS rule)

- Root layout = Server (loads fonts, theme provider tag, metadata).
- App shell layout `(app)/layout.tsx` = Server but renders a Client `<AppShell>` that hosts Zustand providers, TanStack Query provider, ThemeProvider.
- Pages: server by default, but anything reading Dexie or Zustand must be inside a `"use client"` boundary. For prototype, route page files import a `<XxxScreen client>` component and pass no server props.
- Loading.tsx + error.tsx per route. Use Suspense for TanStack Query hydration boundary if needed (not critical this slice).

## ShadCN with Tailwind v4

- Tailwind v4 uses CSS-first config: `@import "tailwindcss"` + `@theme` in `globals.css`. No `tailwind.config.ts` needed (or only minimal `content` if v4-compat).
- ShadCN supports Tailwind v4 via `npx shadcn@latest init` with `tailwindV4` preset. Choose `Zinc` neutral, CSS variables: yes, RSC: yes.
- Components install to `shared/components/ui/` (override path in `components.json`).
- `@theme` block in `globals.css` defines `--color-*`, `--radius-*`, `--font-*` tokens consumed by Tailwind utilities. Doc §12.4 hex values map directly: e.g. `--color-primary: #4F46E5` → utility `bg-primary`.
- Dark mode: Tailwind v4 uses `@variant dark (&:where(.dark, .dark *))` declared in CSS, then toggle `.dark` class on `<html>`.
- Avoid `cn()` from `clsx` shipped via `lib/utils` — keep ShadCN's standard.

## Font loading via next/font

- **Inter**: `next/font/google` — `display: 'swap'`, `variable: '--font-sans'`. Subset latin + latin-ext for VI later.
- **JetBrains Mono**: same pattern, `--font-mono`.
- **Charis SIL**: Google Fonts has it (`Charis SIL`) — load via `next/font/google` with weights 400/700, subsets `["latin","latin-ext"]` (covers most IPA). For full IPA glyph coverage including all phonetic extensions, fall back to OTF self-host: download from SIL site, place at `apps/lexio-web/public/fonts/CharisSIL-Regular.woff2`, load via `next/font/local` with `variable: '--font-ipa'`. Charis SIL Compact preferred (smaller).
- Apply variables to `<html>` className: `${inter.variable} ${jetbrainsMono.variable} ${charisSil.variable}`.
- In Tailwind v4 `@theme`: `--font-sans: var(--font-sans)`, `--font-mono`, `--font-ipa`. Then `font-ipa` utility renders IPA spans.

## Dark mode wiring

- Use `next-themes` (lightweight, ShadCN-recommended). `ThemeProvider attribute="class" defaultTheme="dark" enableSystem`.
- §12.5 rule 10: dark first. Set `defaultTheme="dark"`. Top-bar toggle via `useTheme()`.
- Avoid FOUC: set theme cookie via inline script before hydration (next-themes does this automatically with `enableColorScheme`).

## Bundle / perf budget

- Lighthouse ≥ 95: keep route JS < 200 KB gzip. Avoid Recharts on dashboard initial — lazy-load via `next/dynamic({ ssr: false })`.
- Use `next/image` for any image; mark `priority` only on LCP element (none in this slice).
- Avoid dynamic Tailwind class strings (`bg-${color}`) — Tailwind v4 still requires statically analyzable classes.

## Gotchas

- ShadCN sonner Toaster must be in app shell (client). Install: `npx shadcn add sonner`.
- React 19 strict mode double-invokes effects in dev — Dexie open() must be idempotent (Dexie handles this).
- Tailwind v4 + next-pwa: Workbox webpack plugin runs after next build; verify CSS is included in precache manifest (researcher C).
- `eslint-plugin-boundaries` works with flat config (`eslint.config.js`) — required for ESLint 9 / Next 15.

## Open questions

- Tailwind v4 stable as of plan date? (Assumed yes — released early 2025.)
- ShadCN `tailwindV4` preset: confirm path during scaffolding.

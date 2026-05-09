# Phase 02 — Design system & theme (USER APPROVAL GATE)

## Context links

- Doc §12 entire (brand identity & design system)
- §12.4 CSS variables, §12.5 14 design rules, §12.7.2 icon mapping
- Research: researcher-a-report.md (font loading, Tailwind v4)
- Depends on: phase-01
- Unblocks: phase-06 (app shell uses theme)

## Overview

- **Priority:** P1
- **Status:** complete (awaiting user approval gate)
- **Brief:** Initialize ShadCN with Zinc preset on Tailwind v4. Define exact CSS vars per doc §12.4 (light + dark). Wire Inter / JetBrains Mono / Charis SIL via next/font. Set up Lucide icons + canonical mapping per §12.7.2. Document the 14 strict design rules. Build a `/design` route showcasing all primitives so user can review.
- **GATE:** Stop after this phase for user approval before continuing.

## Key insights

- Dark mode is FIRST per §12.5 rule 10 — defaultTheme = `dark`.
- Charis SIL: try Google Fonts via `next/font/google` first, fallback to local OTF→woff2 (`next/font/local`) if IPA glyph coverage insufficient.
- Avoid Framer Motion (§9.2 — perf-first). Use CSS transitions ≤200ms ease-out only.
- Tailwind v4 reads tokens from `@theme` block in `globals.css`. ShadCN classes consume these via CSS vars.

## Requirements

**Functional:**

- Light + dark themes match exact hex values from doc §12.4.
- Theme toggle in top-right; persists via `next-themes` cookie.
- All ShadCN components use border-only design (no shadows beyond `shadow-sm`).
- IPA-styled spans render in Charis SIL.
- `/design` route lists: Buttons (default/outline/ghost/destructive), Inputs, Card, Badge (semantic variants), Toast (sonner), Dialog, Tooltip, Skeleton, Tabs (underline), Avatar, color swatches, typography ramp, full Lucide canonical icon grid.

**NFR:** No layout shift on theme toggle. FCP <1s on `/design`.

## Architecture

- `apps/lexio-web/app/globals.css` hosts `@theme` + `:root` + `.dark`.
- `shared/components/ui/` — ShadCN primitives.
- `shared/components/theme-provider.tsx` (next-themes wrapper).
- `shared/components/theme-toggle.tsx` (Sun/Moon Lucide icons).
- `shared/icons/icon-map.ts` — single export object mapping doc §12.7.2 names to Lucide imports.
- `shared/design-rules.md` — the 14 rules verbatim, plus quick-reference grid.

## Related code files

**Create:**

- `apps/lexio-web/app/globals.css` (rewrite for Tailwind v4 + design tokens)
- `apps/lexio-web/app/layout.tsx` (font variables on `<html>`, ThemeProvider)
- `apps/lexio-web/app/design/page.tsx` (showcase route)
- `apps/lexio-web/shared/components/ui/*` (button, card, input, badge, dialog, tooltip, skeleton, tabs, avatar, sonner — installed via `npx shadcn add`)
- `apps/lexio-web/shared/components/theme-provider.tsx`
- `apps/lexio-web/shared/components/theme-toggle.tsx`
- `apps/lexio-web/shared/components/typography.tsx` (H1-H4, Body, Caption, Code, IPA wrappers)
- `apps/lexio-web/shared/icons/icon-map.ts`
- `apps/lexio-web/shared/design-rules.md`
- `apps/lexio-web/lib/fonts.ts` (next/font init for Inter, JetBrains Mono, Charis SIL)
- `apps/lexio-web/components.json` (ShadCN config)

**Modify:**

- `apps/lexio-web/next.config.ts` (allow font self-host headers if needed)

## Implementation steps

1. Run `npx shadcn@latest init` in `apps/lexio-web`. Choose: Tailwind v4, RSC=yes, Zinc, CSS variables=yes, components alias `@/shared/components`, utils alias `@/shared/lib/utils`.
2. Install: `pnpm add next-themes lucide-react sonner clsx tailwind-merge class-variance-authority`.
3. Create `lib/fonts.ts`:
   ```ts
   import { Inter, JetBrains_Mono, Charis_SIL } from 'next/font/google';
   export const inter = Inter({
     subsets: ['latin', 'latin-ext'],
     variable: '--font-sans',
     display: 'swap',
   });
   export const jetbrainsMono = JetBrains_Mono({
     subsets: ['latin'],
     variable: '--font-mono',
     display: 'swap',
   });
   export const charisSil = Charis_SIL({
     subsets: ['latin', 'latin-ext'],
     weight: ['400', '700'],
     variable: '--font-ipa',
     display: 'swap',
   });
   ```
   If Google Fonts lacks Charis SIL, replace with `next/font/local` pointing to `public/fonts/CharisSIL-Regular.woff2`.
4. Update `app/layout.tsx` to apply `${inter.variable} ${jetbrainsMono.variable} ${charisSil.variable}` on `<html>` and wrap children in `<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>`.
5. Rewrite `app/globals.css` with EXACT hex values from doc §12.4 — light vars under `:root`, dark vars under `.dark`. Add `@import "tailwindcss"`. Add `@theme inline { --font-sans: var(--font-sans); --font-mono: var(--font-mono); --font-ipa: var(--font-ipa); --color-primary: var(--primary); ... --radius: 0.5rem; }`.
6. Install ShadCN primitives: `npx shadcn add button card input badge dialog tooltip skeleton tabs avatar sonner separator label`.
7. Override default ShadCN button: ensure `default` variant uses `bg-primary` (Indigo 600 light / Indigo 400 dark). No shadows.
8. Create `shared/components/typography.tsx` with H1 (32px/600), H2 (24/600), H3 (20/500), H4 (16/500), Body (14-16/400), Caption (12-13/400), Code (`<code>` JetBrains Mono), `<IPA>` (font-ipa, Charis SIL).
9. Create `shared/icons/icon-map.ts` — re-export Lucide icons under canonical names per §12.7.2:
   ```ts
   export {
     LayoutDashboard as DashboardIcon, BookOpen as DecksIcon, Brain as StudyIcon,
     BarChart3 as StatsIcon, Trophy as AchievementsIcon, Flame as StreakIcon,
     Zap as XpIcon, Volume2 as AudioIcon, RotateCw as FlipIcon, ...
   } from 'lucide-react';
   ```
10. Write `shared/design-rules.md` with the 14 verbatim rules + when to refactor.
11. Build `app/design/page.tsx` showcase route. Sections: Colors (swatches with hex labels), Typography (all variants), Buttons (all variants × dark/light), Inputs, Card, Badge variants, Toast triggers, Dialog, Tooltip, Skeleton, Tabs, Avatar, Lucide icon grid (all canonical mappings).
12. Verify in light + dark — pixel inspect against §12.4.
13. Run WebAIM contrast check on body text + primary button — must pass AA.
14. Commit; **request user approval** before phase-03 onward.

## Todo

- [x] ShadCN init Zinc + Tailwind v4
- [x] `lib/fonts.ts` with Inter, JetBrains Mono, Charis SIL
- [x] `globals.css` with §12.4 exact hex + `@theme`
- [x] ThemeProvider + dark default + toggle
- [x] All ShadCN primitives installed
- [x] `typography.tsx` + IPA component
- [x] `icon-map.ts` per §12.7.2
- [x] `design-rules.md` 14 rules
- [x] `/design` showcase route
- [x] Contrast AA verified
- [ ] **User approval received**

## Success criteria

- `/design` renders all primitives in light & dark; pixel match to doc §12.4.
- ESLint + typecheck pass.
- No gradients, glassmorphism, drop shadows >sm, or border-radius >8px anywhere.
- Charis SIL renders IPA `/ˈleksiˌoʊ/` correctly.
- User explicitly approves.

## Risk assessment

| Risk                                         | Likelihood | Impact | Mitigation                                                                 |
| -------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------- |
| Charis SIL missing on Google Fonts           | M          | L      | Local woff2 fallback                                                       |
| ShadCN Tailwind v4 preset path/version drift | M          | M      | Pin shadcn-cli version; document selections                                |
| Theme FOUC                                   | L          | M      | next-themes + `enableColorScheme` + `suppressHydrationWarning` on `<html>` |

## Security considerations

- Fonts self-hosted or via Google fonts (no third-party tracking).
- CSP-ready (Phase 10 finalizes CSP).

## Next steps

After approval: Phase 03 (clean-arch skeleton) + Phase 06 (app shell) consume these primitives.

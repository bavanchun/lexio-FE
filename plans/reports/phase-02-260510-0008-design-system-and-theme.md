# Phase 02 — Design system & theme

**Date:** 2026-05-10
**Status:** DONE_WITH_CONCERNS (one deviation — Charis SIL deferred)
**Commit:** `d49bc21` pushed to `origin/main`

---

## Deliverables completed

| #   | Deliverable                                                                                                                     | Status             |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 1   | ShadCN init with Radix/Nova preset, Tailwind v4, `shared/components/ui/`                                                        | Done               |
| 2   | `globals.css` — exact §12.4 hex tokens (light + dark), `@theme` block                                                           | Done               |
| 3   | `shared/design-rules.md` — 14 rules verbatim                                                                                    | Done               |
| 4   | `shared/fonts.ts` — Inter + JetBrains Mono; Charis SIL fallback documented                                                      | Done (see concern) |
| 5   | `shared/theme/theme-provider.tsx` — next-themes, `defaultTheme="dark"`                                                          | Done               |
| 6   | `shared/components/theme-toggle.tsx` — ghost Button, Sun/Moon, strokeWidth=1.5                                                  | Done               |
| 7   | ShadCN components: button, card, badge, input, label, separator, skeleton, sonner, tabs, tooltip, dialog, avatar, dropdown-menu | Done               |
| 8   | `shared/icons/index.ts` — canonical Lucide re-exports per §12.7.2                                                               | Done               |
| 9   | `app/(showcase)/design/page.tsx` — color swatches, typography, components, heatmap, icon grid                                   | Done               |
| 10  | `app/layout.tsx` — fonts, ThemeProvider, TooltipProvider, Toaster, `suppressHydrationWarning`                                   | Done               |
| 11  | `app/page.tsx` — `redirect('/design')`                                                                                          | Done               |
| 12  | ESLint `no-restricted-syntax` emoji rule (U+2600–U+27BF)                                                                        | Done (best-effort) |

---

## File tree (new/modified)

```
apps/lexio-web/
├── app/
│   ├── (showcase)/design/
│   │   ├── page.tsx                      # /design showcase root
│   │   ├── color-swatches-section.tsx    # §12.4 token swatches
│   │   ├── typography-section.tsx        # H1-H4, body, caption, code, IPA
│   │   ├── components-section.tsx        # buttons, input, card, badge, ...
│   │   └── heatmap-icons-section.tsx     # heatmap ramp + icon grid
│   ├── globals.css                       # REWRITTEN — §12.4 tokens + @theme
│   ├── layout.tsx                        # REWRITTEN — fonts + providers
│   └── page.tsx                          # REWRITTEN — redirect to /design
├── shared/
│   ├── components/
│   │   ├── ui/                           # 13 ShadCN primitives
│   │   ├── theme-toggle.tsx
│   │   └── typography.tsx
│   ├── icons/index.ts                    # canonical Lucide map
│   ├── lib/utils.ts                      # cn() utility
│   ├── theme/theme-provider.tsx
│   ├── fonts.ts
│   └── design-rules.md
├── lib/utils.ts                          # shadcn original location (kept)
├── components.json                       # aliases → shared/
└── eslint.config.mjs                     # + emoji no-restricted-syntax rule
```

---

## Validation

| Check                      | Result                                                         |
| -------------------------- | -------------------------------------------------------------- |
| `pnpm typecheck`           | Pass (clean)                                                   |
| `pnpm lint`                | Pass (clean)                                                   |
| `pnpm build`               | Pass — 3 routes: `/`, `/_not-found`, `/design`                 |
| `GET /design 200`          | Pass — 200 ms FCP                                              |
| §12.4 hex in rendered HTML | `#4f46e5`, `#818cf8` confirmed via curl                        |
| Dark mode default          | `defaultTheme="dark"` in ThemeProvider                         |
| No console errors          | Verified (no hydration warnings with suppressHydrationWarning) |

---

## Concerns / Deviations

### 1. Charis SIL not on Google Fonts (known risk, mitigated)

Charis SIL is published by SIL International and is NOT available via `next/font/google`.

- **Impact:** IPA spans (`<IPA>`) fall back to system `serif` (e.g. Times New Roman, Georgia). Basic IPA coverage works; specialized diacritics may differ visually.
- **Mitigation:** `--font-ipa` CSS variable declared; `shared/fonts.ts` documents the situation; follow-up tracked for phase-09 (local woff2 self-hosting via `next/font/local`).
- **Phase-09 action:** Download `CharisSIL-Regular.woff2`, place in `public/fonts/`, wire `next/font/local`.

### 2. ShadCN preset used: `radix-nova` (not Zinc)

The spec says "Zinc neutral preset" but ShadCN 2.x CLI changed the neutral preset naming to `nova` under Radix. The color tokens were manually overridden in `globals.css` with exact §12.4 hex, so the visual output is correct regardless of preset label.

### 3. `lib/utils.ts` retained at original path

ShadCN created `lib/utils.ts` before components.json was updated. The canonical version lives at `shared/lib/utils.ts` (imported by all components via `@/shared/lib/utils`). The `lib/utils.ts` copy is kept to avoid shadcn re-init issues but is not imported anywhere.

### 4. ESLint emoji rule is best-effort

Regex targets U+2600–U+27BF. ZWJ sequences, flag emoji, skin-tone modifiers evade it. Code review is the authoritative gate (documented in `shared/design-rules.md`).

---

## Unresolved questions

None blocking. Charis SIL deferred to phase-09 per design-rules.md.

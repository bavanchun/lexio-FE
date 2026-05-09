# Lexio Design Rules — §12.5 (14 strict rules)

All engineers and AI agents working on Lexio UI **must** comply with every rule below.
Violations block PR merge.

---

## The 14 Rules

| #   | Rule                                            | Detail                                                                                                                                                                               |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **No gradients in UI**                          | Gradients are permitted only in logos and hero marketing sections. Never in functional UI (buttons, cards, nav, forms).                                                              |
| 2   | **No heavy shadows**                            | Max 1-layer box-shadow with no large blur. Prefer `border: 1px solid var(--border)` for elevation. `shadow-sm` is the absolute max. No `drop-shadow`, `shadow-lg`, `shadow-xl`, etc. |
| 3   | **No glassmorphism**                            | No `backdrop-blur` combined with alpha/transparent backgrounds. No frosted-glass effects.                                                                                            |
| 4   | **Max 2 accent colors per screen**              | Each view may use at most 2 accent colors simultaneously (e.g. primary indigo + one semantic color).                                                                                 |
| 5   | **Indigo ≤ 10 % pixel area**                    | Primary indigo (`--primary`) must occupy ≤ 10 % of total screen pixels. Reserve for CTAs, focus rings, and active states only.                                                       |
| 6   | **Body text colors only**                       | All paragraph / body text must use `text-foreground` or `text-muted-foreground`. Never use indigo (`text-primary`) for running text.                                                 |
| 7   | **Border-radius ≤ 8 px on functional elements** | Buttons, inputs, cards, badges: `border-radius` ≤ `0.5rem` (8 px). Decorative/marketing elements may exceed this.                                                                    |
| 8   | **Heatmap: monochromatic Zinc → Indigo**        | Activity heatmaps use a single-hue ramp from Zinc-200 (empty) through Zinc-400, Indigo-300, Indigo-500, Indigo-700 (max). No rainbow palettes.                                       |
| 9   | **Charts: Zinc + 1 accent only**                | Data charts use Zinc neutrals for secondary series and exactly 1 accent color (primary indigo) for the featured series.                                                              |
| 10  | **Dark mode designed first**                    | Every component is designed and reviewed in dark mode first. Light mode is derived second. `defaultTheme="dark"` in ThemeProvider.                                                   |
| 11  | **Sentence case for all UI text**               | Labels, buttons, headings, tooltips, toasts — all sentence case. No ALL CAPS, No Title Case For Every Word (unless a proper noun).                                                   |
| 12  | **Two font weights**                            | Body text: weight 400. Interactive labels / subheadings: weight 500. Section headings only: weight 600. Never use 700+ in UI.                                                        |
| 13  | **Animations max 200 ms, ease-out**             | All CSS transitions and animations must complete within 200 ms. Use `ease-out` or `cubic-bezier` variants. No `linear`, no `ease-in`. No Framer Motion (perf policy §9.2).           |
| 14  | **No emoji in functional UI**                   | Use Lucide React icons exclusively (`strokeWidth={1.5}`, sizes `h-3`/`h-4`/`h-5`/`h-6` only). Emoji are permitted only in user-generated content rendered verbatim.                  |

---

## Quick-Reference Checklist (for PR reviewers)

```
[ ] No gradient CSS in component files (background: linear-gradient / from-* to-*)
[ ] No box-shadow class beyond shadow-sm
[ ] No backdrop-blur with bg-opacity / bg-*/[alpha]
[ ] ≤ 2 accent color tokens used per page/view
[ ] Body/paragraph text uses text-foreground or text-muted-foreground only
[ ] All border-radius on functional elements ≤ 0.5rem
[ ] All string literals in sentence case
[ ] Only font-normal (400), font-medium (500), font-semibold (600) used
[ ] Transition duration ≤ 200ms on all animated elements
[ ] No emoji JSX literals in functional components
[ ] All icons imported from @/shared/icons (not directly from lucide-react)
[ ] strokeWidth={1.5} on every Lucide icon instance
```

---

## ESLint Emoji Limitation Note

The `no-restricted-syntax` ESLint rule added in `eslint.config.mjs` attempts to
catch emoji literals in JSX text via a regex on `Literal` nodes. Coverage is
best-effort — it catches common emoji Unicode ranges (U+1F300–U+1FAFF) but
cannot catch all Unicode emoji sequences (ZWJ sequences, variation selectors,
skin tone modifiers, flags). Code review remains the authoritative gate for
emoji enforcement.

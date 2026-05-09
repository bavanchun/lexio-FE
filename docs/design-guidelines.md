# Design guidelines — Lexio

> Mirrors doc §12. This markdown is the linkable reference; the `.docx` remains authoritative.

## Aesthetic philosophy

Minimal-pro. Inspired by Linear, Vercel, Stripe, Notion. Every pixel earns its place.

- **60/30/10 rule:** 60% neutral (Zinc), 30% subtle surface, 10% accent (Indigo)
- No decoration for decoration's sake
- Functional density over empty breathing room
- Dark mode is the default, designed first — light mode is a variant

## Color tokens

### Light mode

| Token                      | Hex       | Usage                               |
| -------------------------- | --------- | ----------------------------------- |
| `--background`             | `#FFFFFF` | Page background                     |
| `--foreground`             | `#09090B` | Primary text                        |
| `--card`                   | `#FFFFFF` | Card surface                        |
| `--card-foreground`        | `#09090B` | Card text                           |
| `--muted`                  | `#F4F4F5` | Subtle backgrounds, inactive states |
| `--muted-foreground`       | `#71717A` | Secondary text, placeholders        |
| `--border`                 | `#E4E4E7` | Borders, dividers                   |
| `--input`                  | `#E4E4E7` | Input borders                       |
| `--primary`                | `#6366F1` | Indigo — CTA, active states         |
| `--primary-foreground`     | `#FFFFFF` | Text on primary                     |
| `--secondary`              | `#F4F4F5` | Secondary button fill               |
| `--secondary-foreground`   | `#18181B` | Text on secondary                   |
| `--accent`                 | `#F4F4F5` | Hover backgrounds                   |
| `--accent-foreground`      | `#18181B` | Text on accent                      |
| `--destructive`            | `#EF4444` | Errors, destructive actions         |
| `--destructive-foreground` | `#FFFFFF` | Text on destructive                 |
| `--ring`                   | `#6366F1` | Focus rings                         |

### Dark mode

| Token                      | Hex       | Usage                    |
| -------------------------- | --------- | ------------------------ |
| `--background`             | `#09090B` | Page background          |
| `--foreground`             | `#FAFAFA` | Primary text             |
| `--card`                   | `#18181B` | Card surface             |
| `--card-foreground`        | `#FAFAFA` | Card text                |
| `--muted`                  | `#27272A` | Subtle backgrounds       |
| `--muted-foreground`       | `#A1A1AA` | Secondary text           |
| `--border`                 | `#27272A` | Borders                  |
| `--input`                  | `#27272A` | Input borders            |
| `--primary`                | `#818CF8` | Indigo 400 — CTA in dark |
| `--primary-foreground`     | `#09090B` | Text on primary          |
| `--secondary`              | `#27272A` | Secondary button fill    |
| `--secondary-foreground`   | `#FAFAFA` | Text on secondary        |
| `--accent`                 | `#27272A` | Hover backgrounds        |
| `--accent-foreground`      | `#FAFAFA` | Text on accent           |
| `--destructive`            | `#7F1D1D` | Dark destructive fill    |
| `--destructive-foreground` | `#FAFAFA` | Text on destructive      |
| `--ring`                   | `#818CF8` | Focus rings              |

All tokens live in `app/globals.css` inside `@theme` block (Tailwind v4 CSS-first config).

## Typography

| Role             | Font           | Source                               |
| ---------------- | -------------- | ------------------------------------ |
| UI / body        | Inter          | `next/font/google`                   |
| Code / monospace | JetBrains Mono | `next/font/google`                   |
| IPA / linguistic | Charis SIL     | Self-hosted woff2 in `public/fonts/` |

### Scale

| Class   | Size        | Weight | Usage            |
| ------- | ----------- | ------ | ---------------- |
| Display | 36px / 40px | 700    | Hero headings    |
| H1      | 30px / 36px | 600    | Page titles      |
| H2      | 24px / 32px | 600    | Section headings |
| H3      | 20px / 28px | 500    | Card headings    |
| Body    | 14px / 20px | 400    | Default prose    |
| Small   | 12px / 16px | 400    | Labels, captions |
| Code    | 13px / 20px | 400    | JetBrains Mono   |

- Line height: 1.5× for body, 1.2× for headings
- Letter spacing: `tracking-tight` on headings, default on body

## Icons

Lucide React — canonical mapping in `shared/icons/index.ts` (doc §12.7.2).

Rules:

- Use only icons from the canonical map — no ad-hoc Lucide imports in feature components
- Icon size: 16px inline, 20px action buttons, 24px primary actions
- No filled/solid variants — outline only (Lucide default)
- Icons never carry meaning alone — always pair with label or `aria-label`

## 14 strict design rules (doc §12.5)

1. **No gradients** — solid colors only; gradients signal low craft
2. **No glassmorphism** — `backdrop-blur` + transparency is forbidden in functional UI
3. **No shadows on shadows** — one elevation layer per component
4. **No rainbow / multi-color charts** — monochrome (Zinc) or single accent (Indigo) only
5. **No emoji in functional UI** — showcase/docs only
6. **Sentence case everywhere** — no Title Case headings, no ALL CAPS labels
7. **No border-radius > 8px on containers** — `rounded-lg` max; `rounded-xl` only on modals
8. **No hover color shifts > 1 tone** — subtle, not jarring
9. **No absolute pixel widths on text** — use relative units (`rem`, `em`, `%`)
10. **No inline styles** — Tailwind classes or CSS vars only
11. **Dark mode designed first** — every new component must pass visual review in dark before light
12. **No decorative dividers** — use spacing (margin/padding) to separate content
13. **Consistent icon sizes per context** — never mix 16px and 24px in the same row
14. **No placeholder lorem ipsum in shipped UI** — real content or semantic placeholders

## ShadCN component rules (doc §12.9)

- All primitives live in `shared/components/ui/` — never modify ShadCN source in feature folders
- Extend via Tailwind `className` prop — never edit generated component internals
- Use `cn()` utility (`shared/lib/utils.ts`) for conditional class merging
- Stick to the Zinc base theme — no other ShadCN color themes
- Dialog, Sheet, Tooltip: always provide `aria-label` or `aria-labelledby`
- Table: always include `<caption>` for screen readers

## Common anti-patterns to avoid

| Anti-pattern                                     | Instead                                        |
| ------------------------------------------------ | ---------------------------------------------- |
| `bg-gradient-to-r from-indigo-500 to-purple-500` | `bg-primary`                                   |
| `backdrop-blur-md bg-white/10`                   | `bg-card`                                      |
| `box-shadow: 0 8px 32px rgba(0,0,0,0.3)`         | `shadow-sm` max                                |
| Multi-color heatmap (red→yellow→green)           | Single hue opacity scale (Indigo)              |
| `😊` in button labels                            | Text only                                      |
| `className="text-2xl font-bold"` inline in page  | `<H2>` from `shared/components/typography.tsx` |
| Hardcoded `width: 640px`                         | `max-w-2xl`                                    |
| `style={{ color: '#6366F1' }}`                   | `text-primary`                                 |
| `LEARN NOW` button label                         | "Start learning"                               |

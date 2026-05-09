---
title: 'Lexio Prototype — FE Vertical Slice (SM-2 + Dexie + PWA)'
description: 'End-to-end FE-only prototype: stub auth → dashboard → flashcard study → SM-2 update → stats. Clean Architecture + ShadCN/Tailwind v4 brand from doc §12.'
status: pending
priority: P1
effort: ~5-7 days
branch: main
tags: [prototype, frontend, nextjs, srs, pwa, clean-arch]
created: 2026-05-09
---

# Lexio prototype — FE vertical slice

**No .NET in this iteration.** All data lives in Dexie/IndexedDB. Backend folders are placeholders for later .NET 10 scaffold.

## Goal (hero flow)

Stub login → Dashboard (due/new/streak/XP/heatmap) → Start study → Flashcard with 4-button rating → SM-2 update → Stats updated → Session summary. Works offline. Lighthouse ≥ 95.

## Phases & dependency graph

| #   | Phase                                      | Status  | Depends on |
| --- | ------------------------------------------ | ------- | ---------- |
| 01  | Monorepo & tooling                         | pending | —          |
| 02  | Design system & theme (USER APPROVAL GATE) | pending | 01         |
| 03  | Clean architecture skeleton                | pending | 01         |
| 04  | SRS engine (pure TS + tests)               | pending | 03         |
| 05  | Dexie persistence + mock API + seed        | pending | 03         |
| 06  | Auth stub + app shell                      | pending | 02, 03     |
| 07  | Vocabulary feature (read-only decks/cards) | pending | 05, 06     |
| 08  | Learning feature (study session — HERO)    | pending | 04, 05, 06 |
| 09  | Statistics feature (dashboard, heatmap)    | pending | 05, 08     |
| 10  | PWA & offline                              | pending | 02, 06     |
| 11  | Tests & perf gates                         | pending | 04-09      |
| 12  | Docs & handoff                             | pending | 11         |

```
01 ──┬─► 02 ──┐
     ├─► 03 ──┴─► 06 ──┬─► 07
     │        │        ├─► 08 ──► 09
     │        ├─► 04 ──┘         │
     │        └─► 05 ────────────┘
     │
     └────────────────► 10 ──► 11 ──► 12
```

## Key decisions

- **Stack**: Next.js 15 (App Router) + React 19 + TS strict + Tailwind v4 + ShadCN (Zinc) + Dexie + TanStack Query + Zustand + RHF/Zod + next-intl + Serwist + Vitest + Playwright + ESLint w/ eslint-plugin-boundaries.
- **Repo**: pnpm workspaces; `apps/lexio-web/`, `services/{identity,vocabulary,learning,statistics,content,notification,social}/` placeholders, `shared/` for future protos.
- **Brand**: doc §12 STRICT — Inter/JetBrains Mono/Charis SIL via next/font; Lucide canonical mapping §12.7.2; 14 design rules in `apps/lexio-web/shared/design-rules.md`.
- **SRS**: SM-2 in `core/use-cases/srs/` as pure TS, ≥95% branch coverage. 4 stages per doc §4.3.2. Adaptive cap per §4.3.3.
- **Auth**: Zustand-only stub. Marked NOT-PROD. No JWT.
- **Seed**: ~30 IT/Tech cards, JSON in `apps/lexio-web/public/data/seed-it-tech.json`, exercises all §4.2 fields.
- **i18n**: next-intl, English locale only.
- **Backend version when scaffolded later**: .NET 10 (user override).

## Approval gate

Phase 02 ships a static visual baseline (theme + tokens + dark mode + sample components). **STOP for user review** before Phase 03+ proceeds.

## Out of scope (this iteration)

- Real auth/JWT, .NET services, Free Dictionary integration, deck CRUD UI, multiple exercise types beyond flashcard, real push delivery, VI locale, social features.

## Success criteria

- E2E Playwright happy path passes (login stub → dashboard → 5-card study → streak +1).
- SM-2 unit coverage ≥ 95% branches.
- Lighthouse Perf/A11y/BP/SEO ≥ 95 on `/dashboard` and `/study`.
- Initial route JS < 200 KB gzip.
- ESLint boundaries: zero violations.
- App functional offline after first load.

## Unresolved questions

1. Charis SIL: Google Fonts version vs SIL self-host OTF? (Plan: try Google first; fallback to local woff2.)
2. Serwist vs `@ducanh2912/next-pwa`? (Plan: Serwist — Next 15 native.)
3. Should heatmap render in RSC or client? (Plan: client + lazy `next/dynamic`.)
4. Should stub user persist across reload? (Plan: yes — Zustand `persist` middleware to localStorage.)

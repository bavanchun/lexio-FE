# Phase 09 — Statistics feature (dashboard + heatmap)

## Context links

- Doc §4.4 (gamification), §12.5 rule 8 (monochromatic Zinc→Indigo heatmap)
- Phase 05 (stats repo), Phase 08 (writes data)
- Depends on: phase-05, phase-08
- Unblocks: phase-11 (E2E asserts streak update)

## Overview

- **Priority:** P1
- **Status:** pending
- **Brief:** `/dashboard` shows due/new/estimated minutes, streak flame + XP/level, GitHub-style heatmap (365 day grid), achievements grid (locked/unlocked).

## Key insights

- Heatmap uses ZINC→INDIGO scale (NOT green) per §12.5 rule 8 — overrides the doc §4.4.3 default. 5 buckets per §4.4.3.
- Dashboard counts come from repos (Dexie). Estimated minutes = `dueCount * 10s + newCount * 30s` (rough).
- Lazy-load heatmap component via `next/dynamic({ ssr: false })` to reduce initial JS.

## Requirements

**Functional:**

- Top bar of dashboard: 3 stat cards — Due today (count + Brain icon), New available (count + Plus icon), Estimated time (Clock icon).
- Top-right: Streak flame card (current + longest), XP card (level + bar to next).
- Heatmap: 365-day grid, monochromatic Zinc→Indigo (`zinc-200` → `zinc-300` → `indigo-300` → `indigo-500` → `indigo-700`). Click day → modal with reviews count + accuracy + minutes (data may be empty in prototype).
- Achievements grid: 10 badges from §4.4.4 with locked (muted, gray) vs unlocked (color icon) state. Locked entries show trigger condition.
- "Start study" CTA button (primary) when due > 0 or new > 0.

**NFR:** Dashboard JS budget ≤ 180 KB (heatmap lazy split).

## Architecture

```
features/statistics/
├── components/
│   ├── dashboard-page.tsx
│   ├── stat-card.tsx
│   ├── streak-card.tsx
│   ├── xp-card.tsx
│   ├── heatmap.tsx                  # lazy-loaded
│   ├── heatmap-cell.tsx
│   ├── heatmap-day-modal.tsx
│   ├── achievements-grid.tsx
│   └── achievement-tile.tsx
├── hooks/
│   ├── use-dashboard-stats.ts
│   └── use-heatmap-data.ts
├── services/
│   └── stats-queries.ts
├── lib/
│   └── heatmap-color-scale.ts       # bucket → CSS class
├── types/
└── index.ts
```

## Related code files

**Create:**

- `apps/lexio-web/app/(app)/dashboard/page.tsx` (replace placeholder)
- `apps/lexio-web/app/(app)/stats/page.tsx` (alias — same component or detailed view)
- `apps/lexio-web/features/statistics/components/*` (per architecture)
- `apps/lexio-web/features/statistics/hooks/*`
- `apps/lexio-web/features/statistics/services/stats-queries.ts`
- `apps/lexio-web/features/statistics/lib/heatmap-color-scale.ts`
- `apps/lexio-web/features/statistics/index.ts`
- Tests:
- `apps/lexio-web/tests/unit/heatmap-color-scale.test.ts`
- `apps/lexio-web/tests/integration/statistics/dashboard.test.tsx`

## Implementation steps

1. `stats-queries.ts`: `useDashboardStats(userId)` returns `{ due, new, estMinutes, streak, xp, level, xpToNext }`. `useHeatmap(userId, fromIso, toIso)` returns `Record<isoDate, count>` from `streaks.heatmapData`.
2. Build SSR-safe `DashboardPage` shell (RSC). Inside, render client `<DashboardClient>`.
3. `StatCard` — ShadCN Card with Lucide icon + label + big number.
4. `StreakCard` — Lucide `Flame` (success color when active, muted when broken) + count + longest record subtitle.
5. `XpCard` — `Zap` icon + level + linear progress bar to next level (use ShadCN Progress).
6. `Heatmap` — pure SVG (no Recharts). 53 weeks × 7 days grid. 12px cells, 2px gap, rounded 2px. Color per `heatmap-color-scale.ts`:
   - 0 → bg-zinc-200/dark:bg-zinc-800
   - 1-10 → bg-indigo-200/dark:bg-indigo-900
   - 11-30 → bg-indigo-400/dark:bg-indigo-700
   - 31-100 → bg-indigo-600/dark:bg-indigo-500
   - 100+ → bg-indigo-800/dark:bg-indigo-300
     Tooltip on each cell (date + count). Click → `<HeatmapDayModal>` with details (count, minutes, accuracy).
7. Lazy-import `Heatmap` in DashboardClient: `const Heatmap = dynamic(() => import('@/features/statistics/components/heatmap'), { ssr: false, loading: () => <HeatmapSkeleton /> })`.
8. `AchievementsGrid` — 10 tiles. Locked: grayscale icon + "Locked" caption + trigger text. Unlocked: color icon + earned date.
9. Wire up "Start study" CTA → call `useStartSession` → navigate.

## Todo

- [ ] stats-queries hooks
- [ ] DashboardPage layout
- [ ] StatCard, StreakCard, XpCard
- [ ] Heatmap (SVG, lazy-loaded)
- [ ] HeatmapDayModal
- [ ] AchievementsGrid
- [ ] heatmap-color-scale unit test
- [ ] Integration test: dashboard renders with seeded zero state

## Success criteria

- Fresh seed: dashboard shows due=30, new=30 (or however adaptive cap distributes), streak=0.
- After completing a 5-card session (phase 08): streak=1, XP increased by sum, heatmap cell for today colored.
- All colors monochromatic Zinc→Indigo (no green).
- Heatmap not in initial JS bundle (verified by `pnpm analyze`).

## Risk assessment

| Risk                                      | Likelihood | Impact | Mitigation                                                        |
| ----------------------------------------- | ---------- | ------ | ----------------------------------------------------------------- |
| Heatmap pulls Recharts despite custom SVG | L          | M      | No Recharts import — pure SVG; verify with bundle analyzer        |
| Date-bucketing off by one TZ              | M          | M      | All ISO dates in user TZ; use `date-fns` `formatISO` consistently |
| Locked achievements show wrong status     | L          | L      | Drive from Dexie achievements table only                          |

## Security considerations

- N/A — read-only display of user-owned data.

## Next steps

Phase 11 E2E asserts dashboard reflects post-session state.

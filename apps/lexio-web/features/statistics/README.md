# statistics feature

## Scope

Progress dashboard: streak heatmap, XP/level display, review history charts, and achievement badges.

## Layers owned

- `components/` — StreakHeatmap, XpBar, ReviewChart, BadgeGrid
- `hooks/` — useStreak, useUserXp, useAchievements
- `services/` — TanStack Query wrappers over streak/xp/achievement repositories
- `store/` — Zustand slice for stats cache
- `types/` — feature-local TS types

## Public API

Import exclusively from `features/statistics` (the barrel). Internal paths are private.

## Dependencies

- `core/ports/streak-repository`, `core/ports/user-xp-repository`, `core/ports/achievement-repository`
- `core/entities/streak`, `core/entities/user-xp`, `core/entities/achievement`
- `shared/components/ui/*`

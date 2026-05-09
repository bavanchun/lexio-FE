# learning feature

## Scope

SRS study sessions: card queue, rating UI (Again/Hard/Good/Easy), session lifecycle, and exercise rendering (flashcard, multiple-choice, type-answer, listening).

## Layers owned

- `components/` — StudySession, CardFlipper, RatingBar, ExerciseRenderer
- `hooks/` — useStudySession, useCardQueue, useRating
- `services/` — TanStack Query + SRS use-cases from core/use-cases/srs
- `store/` — Zustand slice for active session state
- `types/` — feature-local TS types

## Public API

Import exclusively from `features/learning` (the barrel). Internal paths are private.

## Dependencies

- `core/use-cases/srs/*` (SM-2 engine — phase-04)
- `core/ports/user-card-repository`, `core/ports/review-repository`, `core/ports/session-repository`
- `core/entities/user-card`, `core/entities/review`, `core/entities/session`
- `shared/components/ui/*`

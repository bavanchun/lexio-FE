# vocabulary feature

## Scope

Browse, search, and manage flashcard decks and individual cards. Includes deck creation, card editing, and public deck discovery.

## Layers owned

- `components/` — DeckList, DeckCard, CardEditor, SearchBar
- `hooks/` — useDecks, useCards, useCardSearch
- `services/` — TanStack Query wrappers over ICardRepository, IDeckRepository
- `store/` — Zustand slice for selected deck / active card
- `types/` — feature-local TS types

## Public API

Import exclusively from `features/vocabulary` (the barrel). Internal paths are private.

## Dependencies

- `core/ports/card-repository` (ICardRepository)
- `core/ports/deck-repository` (IDeckRepository)
- `core/entities/card`, `core/entities/deck`
- `shared/components/ui/*`

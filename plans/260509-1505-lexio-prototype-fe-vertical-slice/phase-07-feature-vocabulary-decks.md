# Phase 07 — Vocabulary feature (read-only decks/cards)

## Context links

- Doc §4.2 (card schema), §6.7.5 (feature folders)
- Depends on: phase-05 (repos), phase-06 (shell)
- Unblocks: phase-08 (study session links from deck detail)

## Overview

- **Priority:** P2
- **Status:** pending
- **Brief:** Deck list at `/decks` and deck detail at `/decks/[deckId]` showing the seed deck's 30 cards. **Read-only this iteration** — no create/edit (KISS for prototype).

## Key insights

- All data from Dexie via `lib/api/` wrappers.
- Card detail row shows: word, IPA (Charis SIL), part of speech, CEFR badge, frequency rank, stage badge.
- "Start study" CTA button → creates session and navigates to `/study/[sessionId]`.

## Requirements

**Functional:**

- `/decks` lists all decks (just one in seed). Each row: title, card count, last studied date, CTA "Open".
- `/decks/[deckId]` shows: deck title, description, cards table (word | pos | IPA | meaning_vi | stage badge). "Start study" button.
- Empty/loading/error states (Skeleton, Alert).

**NFR:** Route JS < 100 KB. Table virtualized only if > 100 rows (not needed at 30).

## Architecture

```
features/vocabulary/
├── components/
│   ├── deck-list.tsx
│   ├── deck-list-item.tsx
│   ├── deck-detail.tsx
│   ├── card-table.tsx
│   ├── card-row.tsx
│   └── stage-badge.tsx
├── hooks/
│   ├── use-decks.ts
│   └── use-deck-detail.ts
├── services/
│   └── deck-queries.ts        # TanStack Query wrappers
├── types/index.ts
└── index.ts
```

## Related code files

**Create:**

- `apps/lexio-web/app/(app)/decks/page.tsx`
- `apps/lexio-web/app/(app)/decks/[deckId]/page.tsx`
- `apps/lexio-web/features/vocabulary/components/{deck-list,deck-list-item,deck-detail,card-table,card-row,stage-badge}.tsx`
- `apps/lexio-web/features/vocabulary/hooks/{use-decks,use-deck-detail}.ts`
- `apps/lexio-web/features/vocabulary/services/deck-queries.ts`
- `apps/lexio-web/features/vocabulary/index.ts` (barrel)
- Tests:
- `apps/lexio-web/tests/integration/vocabulary/deck-list.test.tsx`

## Implementation steps

1. Create `deck-queries.ts` — `decksAllQuery(userId)` and `deckByIdQuery(userId, deckId)` calling `deck-repository` + `card-repository` + `user-card-repository.findByDeck`.
2. `use-decks` wraps useQuery with key `['decks', userId]`.
3. `DeckList` component renders array via `<DeckListItem>`. Use ShadCN Card + Badge.
4. `DeckDetail` renders header + `<CardTable>`. Header has `<Button>Start study</Button>` → calls `useStartSession({ deckId })` (defined in phase-08 services) → navigate to `/study/[sessionId]`.
5. `CardTable` uses ShadCN Table. Columns: Word (Inter 500), POS (Badge muted), IPA (`<IPA>` font Charis SIL), Meaning (truncate with Tooltip), Stage badge (color from §12.3.3 only for Mature=success, Young=info, Learning=warning, New=muted).
6. Empty deck state: Lucide `BookOpen` muted icon + "No cards in this deck yet."
7. Loading: ShadCN Skeleton list.
8. Error: ShadCN Alert with destructive variant.

## Todo

- [ ] deck-queries service
- [ ] use-decks, use-deck-detail hooks
- [ ] DeckList + DeckListItem
- [ ] DeckDetail
- [ ] CardTable + CardRow + StageBadge
- [ ] Routes wired
- [ ] Integration test for DeckList

## Success criteria

- `/decks` shows seed deck "IT/Tech Essentials" with count 30.
- `/decks/[id]` shows table of 30 cards with IPA in Charis SIL.
- "Start study" navigates to a freshly-created session.
- ESLint boundaries clean.

## Risk assessment

| Risk                                                        | Likelihood | Impact | Mitigation                                                                  |
| ----------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------- |
| Cross-feature import (vocabulary→learning to start session) | M          | M      | Use shared event bus or `lib/api` wrapper; don't import learning components |

## Security considerations

- Render meaning/examples as plain text. No HTML.
- Personal note (out of scope) would need sanitize.

## Next steps

Phase 08 takes over once "Start study" is clicked.

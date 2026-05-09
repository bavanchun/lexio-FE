/**
 * vocabulary feature public barrel.
 * External code MUST import from this barrel — not from internal paths.
 *
 * eslint-disable boundaries/dependencies — intra-feature re-exports
 * are intentional: this barrel collects sub-module exports for external consumers.
 * The boundaries rule (features→features) fires because checkInternals:true
 * treats all files under features/** as the same type. Suppressed per-line below.
 */

// Components
// eslint-disable-next-line boundaries/dependencies
export { DeckCard } from './components/deck-card';
// eslint-disable-next-line boundaries/dependencies
export { DeckGrid } from './components/deck-grid';
// eslint-disable-next-line boundaries/dependencies
export { CardsTable } from './components/cards-table';
// eslint-disable-next-line boundaries/dependencies
export { CardPreviewDrawer } from './components/card-preview-drawer';
// eslint-disable-next-line boundaries/dependencies
export { StageBadge } from './components/stage-badge';

// Services (TanStack Query hooks)
// eslint-disable-next-line boundaries/dependencies
export { useDecks } from './services/use-decks';
// eslint-disable-next-line boundaries/dependencies
export { useDeck } from './services/use-deck';
// eslint-disable-next-line boundaries/dependencies
export { useDeckCards } from './services/use-deck-cards';

// Hooks
// eslint-disable-next-line boundaries/dependencies
export { useAudioPlayback } from './hooks/use-audio-playback';

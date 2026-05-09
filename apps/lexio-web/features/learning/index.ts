/**
 * learning feature public barrel.
 * External code MUST import from this barrel — not from internal paths.
 *
 * eslint-disable boundaries/dependencies — intra-feature re-exports
 * are intentional: this barrel collects sub-module exports for external consumers.
 * The boundaries rule (features→features) fires because checkInternals:true
 * treats all files under features/** as the same type. Suppressed per-line below.
 */

// Components
// eslint-disable-next-line boundaries/dependencies
export { StudySession } from './components/study-session';
// eslint-disable-next-line boundaries/dependencies
export { Flashcard } from './components/flashcard';
// eslint-disable-next-line boundaries/dependencies
export { FlashcardFront } from './components/flashcard-front';
// eslint-disable-next-line boundaries/dependencies
export { FlashcardBack } from './components/flashcard-back';
// eslint-disable-next-line boundaries/dependencies
export { RatingBar } from './components/rating-bar';
// eslint-disable-next-line boundaries/dependencies
export { AudioButton } from './components/audio-button';
// eslint-disable-next-line boundaries/dependencies
export { SessionProgress } from './components/session-progress';
// eslint-disable-next-line boundaries/dependencies
export { SessionSummary } from './components/session-summary';

// Store
// eslint-disable-next-line boundaries/dependencies
export { useSessionStore } from './store/session-store';

// Hooks
// eslint-disable-next-line boundaries/dependencies
export { useStudySession } from './hooks/use-study-session';
// eslint-disable-next-line boundaries/dependencies
export { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';

// Types
// eslint-disable-next-line boundaries/dependencies
export type { QueueItem, SessionSummary as SessionSummaryData, SubmitReviewResult } from './types';

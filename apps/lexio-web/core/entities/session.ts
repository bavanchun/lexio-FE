/**
 * Session entity — doc §7.2
 * Represents a single study session. Pure TS — no framework imports.
 */

import type { DeckId } from './card';
import type { SessionId } from './review';

export type { SessionId };

export interface Session {
  id: SessionId;
  userId: string;
  /** Optional: session may be free-study (no specific deck) */
  deckId: DeckId | null;
  startedAt: string; // ISO 8601
  endedAt: string | null; // ISO 8601, null if session still in progress
  cardsReviewed: number;
  newCards: number;
}

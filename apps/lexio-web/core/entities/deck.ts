/**
 * Deck entity — doc §7.2
 * A collection of flashcards. Pure TS — no framework imports.
 */

import type { DeckId } from './card';

export type { DeckId };

export type Visibility = 'private' | 'public' | 'unlisted';

export interface Deck {
  id: DeckId;
  /** ID of the user who owns / created this deck */
  ownerId: string;
  title: string;
  description: string | null;
  visibility: Visibility;
  /** Number of times this deck has been cloned by other users */
  cloneCount: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Card entity — doc §4.2
 * Represents a single vocabulary flashcard. Pure TS — no framework imports.
 */

export type CardId = string & { readonly _brand: 'CardId' };
export type DeckId = string & { readonly _brand: 'DeckId' };

/** CEFR proficiency levels */
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** Supported exercise types */
export type ExerciseType = 'flashcard' | 'multiple_choice' | 'type' | 'listening' | 'context';

/**
 * Card — all 16 fields per §4.2.
 * audio* fields are nullable (assets may not exist yet).
 */
export interface Card {
  id: CardId;
  deckId: DeckId;
  /** Front-side word or phrase */
  word: string;
  /** Phonemic transcription in IPA notation */
  ipa: string | null;
  /** Primary definition / back-side content */
  definition: string;
  /** Example sentence using the word */
  exampleSentence: string | null;
  /** Translation of the example sentence */
  exampleTranslation: string | null;
  /** Audio URL for word pronunciation */
  audioWordUrl: string | null;
  /** Audio URL for example sentence */
  audioSentenceUrl: string | null;
  /** Image illustration URL */
  imageUrl: string | null;
  /** Tags for filtering/grouping (e.g., ["noun", "formal"]) */
  tags: string[];
  /** CEFR difficulty level */
  cefrLevel: CefrLevel | null;
  /** Supported exercise types for this card */
  exerciseTypes: ExerciseType[];
  /** Creator user ID */
  createdBy: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

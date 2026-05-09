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
 * Word family — related forms across parts of speech.
 * All members are optional; include only those that exist for the word.
 */
export interface WordFamily {
  verb?: string;
  noun?: string;
  adj?: string;
  adv?: string;
}

/**
 * Card — all fields per §4.2.
 * Nullable fields are optional assets or data not yet available in the prototype.
 */
export interface Card {
  id: CardId;
  deckId: DeckId;
  /** Front-side word or phrase */
  word: string;
  /** IPA transcription — US variant (replaces the previous single ipa field) */
  ipaUs: string | null;
  /** IPA transcription — UK variant */
  ipaUk: string | null;
  /**
   * @deprecated Use ipaUs / ipaUk.
   * Kept for backwards compat with seed loader until migration is complete.
   */
  ipa?: string | null;
  /** Primary definition / back-side content */
  definition: string;
  /** Example sentence using the word */
  exampleSentence: string | null;
  /** Translation of the example sentence */
  exampleTranslation: string | null;
  /** Audio URL for US pronunciation */
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
  /** Common collocations — words that frequently appear together with this word */
  collocations: string[];
  /** Synonyms for the word in context */
  synonyms: string[];
  /** Antonyms for the word in context */
  antonyms: string[];
  /** Related word forms across parts of speech */
  wordFamily: WordFamily | null;
  /** Origin and history of the word */
  etymology: string | null;
  /** Corpus frequency rank (1 = most frequent); null if unknown */
  frequencyRank: number | null;
  /** Creator user ID */
  createdBy: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Zod schema for Card entity — mirrors core/entities/card.ts
 * Use at system boundaries (API responses, seed JSON reads).
 */

import { z } from 'zod';

export const CefrLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export const ExerciseTypeSchema = z.enum([
  'flashcard',
  'multiple_choice',
  'type',
  'listening',
  'context',
]);

/** Word family — related forms across parts of speech (all members optional). Nullable, never undefined. */
export const WordFamilySchema = z
  .object({
    verb: z.string().optional(),
    noun: z.string().optional(),
    adj: z.string().optional(),
    adv: z.string().optional(),
  })
  .nullable()
  .default(null);

export const CardSchema = z.object({
  id: z.string(),
  deckId: z.string(),
  word: z.string().min(1),
  /** IPA — US variant */
  ipaUs: z.string().nullable(),
  /** IPA — UK variant */
  ipaUk: z.string().nullable(),
  /** @deprecated use ipaUs/ipaUk — kept for seed-loader backwards compat */
  ipa: z.string().nullable().optional(),
  definition: z.string().min(1),
  exampleSentence: z.string().nullable(),
  exampleTranslation: z.string().nullable(),
  audioWordUrl: z.string().url().nullable(),
  audioSentenceUrl: z.string().url().nullable(),
  imageUrl: z.string().url().nullable(),
  tags: z.array(z.string()),
  cefrLevel: CefrLevelSchema.nullable(),
  exerciseTypes: z.array(ExerciseTypeSchema),
  collocations: z.array(z.string()),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()),
  wordFamily: WordFamilySchema,
  etymology: z.string().nullable(),
  frequencyRank: z.number().int().positive().nullable(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Card = z.infer<typeof CardSchema>;

export const parseCard = (input: unknown): Card => CardSchema.parse(input);
export const safeParseCard = (input: unknown) => CardSchema.safeParse(input);

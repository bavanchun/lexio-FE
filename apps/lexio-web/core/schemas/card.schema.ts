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

export const CardSchema = z.object({
  id: z.string(),
  deckId: z.string(),
  word: z.string().min(1),
  ipa: z.string().nullable(),
  definition: z.string().min(1),
  exampleSentence: z.string().nullable(),
  exampleTranslation: z.string().nullable(),
  audioWordUrl: z.string().url().nullable(),
  audioSentenceUrl: z.string().url().nullable(),
  imageUrl: z.string().url().nullable(),
  tags: z.array(z.string()),
  cefrLevel: CefrLevelSchema.nullable(),
  exerciseTypes: z.array(ExerciseTypeSchema),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Card = z.infer<typeof CardSchema>;

export const parseCard = (input: unknown): Card => CardSchema.parse(input);
export const safeParseCard = (input: unknown) => CardSchema.safeParse(input);

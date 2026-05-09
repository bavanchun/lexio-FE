/**
 * Zod schema for Deck entity — mirrors core/entities/deck.ts
 * Use at system boundaries (API responses, seed JSON reads).
 */

import { z } from 'zod';

export const VisibilitySchema = z.enum(['private', 'public', 'unlisted']);

export const DeckSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string().min(1),
  description: z.string().nullable(),
  visibility: VisibilitySchema,
  cloneCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Deck = z.infer<typeof DeckSchema>;

export const parseDeck = (input: unknown): Deck => DeckSchema.parse(input);
export const safeParseDeck = (input: unknown) => DeckSchema.safeParse(input);

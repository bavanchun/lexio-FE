/**
 * Zod schema for UserCard entity — mirrors core/entities/user-card.ts
 * Use at system boundaries (Dexie reads, API responses).
 */

import { z } from 'zod';

export const StageSchema = z.enum(['New', 'Learning', 'Young', 'Mature']);

export const UserCardSchema = z.object({
  id: z.string(),
  userId: z.string(),
  cardId: z.string(),
  deckId: z.string(),
  stage: StageSchema,
  easeFactor: z.number().positive(),
  intervalDays: z.number().int().nonnegative(),
  intervalMinutes: z.number().int().nonnegative().optional(),
  repetitions: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  consecutiveGoods: z.number().int().nonnegative(),
  nextReviewAt: z.string().datetime(),
  isFavorite: z.boolean(),
  personalNote: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserCard = z.infer<typeof UserCardSchema>;

export const parseUserCard = (input: unknown): UserCard => UserCardSchema.parse(input);
export const safeParseUserCard = (input: unknown) => UserCardSchema.safeParse(input);

/**
 * Zod schema for Review entity — mirrors core/entities/review.ts
 * Use at system boundaries (Dexie reads, session sync).
 */

import { z } from 'zod';
import { ExerciseTypeSchema } from './card.schema';

export const RatingSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

export const ReviewSchema = z.object({
  id: z.string(),
  userCardId: z.string(),
  sessionId: z.string(),
  rating: RatingSchema,
  durationMs: z.number().int().nonnegative(),
  exerciseType: ExerciseTypeSchema,
  reviewedAt: z.string().datetime(),
});

export type Review = z.infer<typeof ReviewSchema>;

export const parseReview = (input: unknown): Review => ReviewSchema.parse(input);
export const safeParseReview = (input: unknown) => ReviewSchema.safeParse(input);

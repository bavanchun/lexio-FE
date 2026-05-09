/**
 * Zod schema for User entity — mirrors core/entities/user.ts
 * Use at system boundaries (auth responses, session storage).
 */

import { z } from 'zod';

export const RoleSchema = z.enum(['Guest', 'Learner', 'VerifiedCreator', 'Moderator', 'Admin']);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1),
  role: RoleSchema,
  isVerified: z.boolean(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const parseUser = (input: unknown): User => UserSchema.parse(input);
export const safeParseUser = (input: unknown) => UserSchema.safeParse(input);

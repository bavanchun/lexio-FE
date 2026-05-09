/**
 * User entity — doc §7.2
 * Application user profile. Pure TS — no framework imports.
 */

export type UserId = string & { readonly _brand: 'UserId' };

export type Role = 'Guest' | 'Learner' | 'VerifiedCreator' | 'Moderator' | 'Admin';

export interface User {
  id: UserId;
  email: string;
  displayName: string;
  role: Role;
  isVerified: boolean;
  createdAt: string; // ISO 8601
}

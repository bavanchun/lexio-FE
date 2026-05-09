/**
 * core/ barrel — single import surface for all entities, schemas, and ports.
 * Consumers: features/*, lib/* (via port interfaces only).
 * Pure TS — zero React, Next, or Dexie imports allowed in this layer.
 */

// ── Entities ──────────────────────────────────────────────────────────────
export type { Card, CardId, DeckId, CefrLevel, ExerciseType } from './entities/card';
export type { Deck, Visibility } from './entities/deck';
export type { UserCard, UserCardId, Stage } from './entities/user-card';
export type { Review, ReviewId, SessionId, Rating } from './entities/review';
export type { Session } from './entities/session';
export type { Streak } from './entities/streak';
export type { UserXp } from './entities/user-xp';
export type { Achievement, AchievementId } from './entities/achievement';
export type { User, UserId, Role } from './entities/user';

// ── Schemas ────────────────────────────────────────────────────────────────
export {
  CardSchema,
  CefrLevelSchema,
  ExerciseTypeSchema,
  parseCard,
  safeParseCard,
} from './schemas/card.schema';
export type { Card as CardParsed } from './schemas/card.schema';

export { DeckSchema, VisibilitySchema, parseDeck, safeParseDeck } from './schemas/deck.schema';

export {
  UserCardSchema,
  StageSchema,
  parseUserCard,
  safeParseUserCard,
} from './schemas/user-card.schema';

export { ReviewSchema, RatingSchema, parseReview, safeParseReview } from './schemas/review.schema';

export { UserSchema, RoleSchema, parseUser, safeParseUser } from './schemas/user.schema';

// ── Ports ──────────────────────────────────────────────────────────────────
export type { ICardRepository, CardSearchQuery } from './ports/card-repository';
export type { IDeckRepository } from './ports/deck-repository';
export type { IUserCardRepository } from './ports/user-card-repository';
export type { IReviewRepository } from './ports/review-repository';
export type { ISessionRepository } from './ports/session-repository';
export type { IStreakRepository } from './ports/streak-repository';
export type { IUserXpRepository } from './ports/user-xp-repository';
export type { IAchievementRepository } from './ports/achievement-repository';
export type { IAuthService } from './ports/auth-service';

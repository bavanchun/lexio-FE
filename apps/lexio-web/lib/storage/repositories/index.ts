/**
 * Repository barrel — exports all Dexie adapters and a factory function.
 *
 * Usage:
 *   import { createRepositories } from '@/lib/storage/repositories';
 *   const repos = createRepositories(db);
 *   const cards = await repos.cards.listByDeck(deckId);
 */

export { CardRepositoryDexie } from './card-repository-dexie';
export { DeckRepositoryDexie } from './deck-repository-dexie';
export { UserCardRepositoryDexie } from './user-card-repository-dexie';
export { ReviewRepositoryDexie } from './review-repository-dexie';
export { SessionRepositoryDexie } from './session-repository-dexie';
export { StreakRepositoryDexie } from './streak-repository-dexie';
export { UserXpRepositoryDexie } from './user-xp-repository-dexie';
export { AchievementRepositoryDexie } from './achievement-repository-dexie';

import type { ICardRepository } from '@/core/ports/card-repository';
import type { IDeckRepository } from '@/core/ports/deck-repository';
import type { IUserCardRepository } from '@/core/ports/user-card-repository';
import type { IReviewRepository } from '@/core/ports/review-repository';
import type { ISessionRepository } from '@/core/ports/session-repository';
import type { IStreakRepository } from '@/core/ports/streak-repository';
import type { IUserXpRepository } from '@/core/ports/user-xp-repository';
import type { IAchievementRepository } from '@/core/ports/achievement-repository';
import type { LexioDB } from '../database';

import { CardRepositoryDexie } from './card-repository-dexie';
import { DeckRepositoryDexie } from './deck-repository-dexie';
import { UserCardRepositoryDexie } from './user-card-repository-dexie';
import { ReviewRepositoryDexie } from './review-repository-dexie';
import { SessionRepositoryDexie } from './session-repository-dexie';
import { StreakRepositoryDexie } from './streak-repository-dexie';
import { UserXpRepositoryDexie } from './user-xp-repository-dexie';
import { AchievementRepositoryDexie } from './achievement-repository-dexie';

export interface Repositories {
  cards: ICardRepository;
  decks: IDeckRepository;
  userCards: IUserCardRepository;
  reviews: IReviewRepository;
  sessions: ISessionRepository;
  streaks: IStreakRepository;
  userXp: IUserXpRepository;
  achievements: IAchievementRepository;
}

/**
 * Factory — wires all Dexie adapters to the given db instance.
 * Enables easy substitution in tests (pass a fake-indexeddb-backed db).
 */
export function createRepositories(db: LexioDB): Repositories {
  return {
    cards: new CardRepositoryDexie(db),
    decks: new DeckRepositoryDexie(db),
    userCards: new UserCardRepositoryDexie(db),
    reviews: new ReviewRepositoryDexie(db),
    sessions: new SessionRepositoryDexie(db),
    streaks: new StreakRepositoryDexie(db),
    userXp: new UserXpRepositoryDexie(db),
    achievements: new AchievementRepositoryDexie(db),
  };
}

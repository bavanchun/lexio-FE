/**
 * start-session — FE orchestrator for creating a study session.
 * Composes core SRS use cases + injected repositories.
 * Dependencies injected to enable unit testing without real Dexie.
 */

import type { IUserCardRepository } from '@/core/ports/user-card-repository';
import type { ISessionRepository } from '@/core/ports/session-repository';
import type { IStreakRepository } from '@/core/ports/streak-repository';
import type { ICardRepository } from '@/core/ports/card-repository';
import type { Session } from '@/core/entities/session';
import type { UserCard } from '@/core/entities/user-card';
import type { DeckId } from '@/core/entities/card';
// eslint-disable-next-line boundaries/dependencies
import type { QueueItem } from '../types';
import { getSessionQueue } from '@/core/use-cases/srs/get-session-queue';
import { STUB_USER_ID } from '@/lib/storage/seed-loader';

export interface StartSessionDeps {
  userCardRepo: IUserCardRepository;
  sessionRepo: ISessionRepository;
  streakRepo: IStreakRepository;
  cardRepo: ICardRepository;
}

export interface StartSessionInput {
  deckId: DeckId;
  userId?: string;
  now?: Date;
  /** User's daily new-card target. Defaults to 15. */
  dailyTarget?: number;
}

export interface StartSessionOutput {
  session: Session;
  queue: QueueItem[];
}

/**
 * Builds the session queue and persists a new Session row.
 * Returns the session + enriched queue (UserCard + base Card pairs).
 */
export async function startSession(
  deps: StartSessionDeps,
  input: StartSessionInput,
): Promise<StartSessionOutput> {
  const { userCardRepo, sessionRepo, cardRepo } = deps;
  const userId = input.userId ?? STUB_USER_ID;
  const now = input.now ?? new Date();
  const dailyTarget = input.dailyTarget ?? 15;

  // 1. Fetch due cards — excludes New-stage cards (they have their own slot below)
  const allDue: UserCard[] = await userCardRepo.listDue(userId, now.toISOString(), 200);
  const dueCards: UserCard[] = allDue.filter((uc) => uc.stage !== 'New');

  // 2. Fetch new cards (not yet started, up to generous limit — cap applied below)
  const newCards: UserCard[] = await userCardRepo.listNew(userId, 50);

  // 3. Compute retention estimate — simple proxy: ratio of mature+young to all
  const allUserCards = await userCardRepo.listDue(
    userId,
    new Date(8640000000000000).toISOString(),
    1000,
  );
  const matureYoung = allUserCards.filter(
    (uc) => uc.stage === 'Mature' || uc.stage === 'Young',
  ).length;
  const retention7d = allUserCards.length > 0 ? matureYoung / allUserCards.length : 1.0;

  // 4. Build adaptive queue
  const { dueQueue, newQueue } = getSessionQueue({
    dueCards,
    newCards,
    dueTodayCount: dueCards.length,
    retention7d,
    target: dailyTarget,
  });

  const combinedUserCards = [...dueQueue, ...newQueue];

  // 5. Create session row
  // cardsReviewed and newCards start at 0 — submitReview increments them as reviews are submitted.
  const session = await sessionRepo.create({
    userId,
    deckId: input.deckId,
    startedAt: now.toISOString(),
    endedAt: null,
    cardsReviewed: 0,
    newCards: 0,
  });

  // 6. Enrich each UserCard with its base Card data
  const queue: QueueItem[] = [];
  for (const userCard of combinedUserCards) {
    const card = await cardRepo.findById(userCard.cardId);
    if (card) {
      queue.push({ userCard, card });
    }
  }

  return { session, queue };
}

/**
 * Storage layer error types.
 * Repositories catch Dexie errors and re-throw as RepositoryError so
 * callers never depend on Dexie-specific error shapes.
 */

export class RepositoryError extends Error {
  constructor(
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class NotFoundError extends RepositoryError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends RepositoryError {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} already exists with ${field}: ${value}`);
    this.name = 'DuplicateError';
  }
}

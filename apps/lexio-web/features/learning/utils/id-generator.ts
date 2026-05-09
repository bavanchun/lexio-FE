/**
 * Lightweight ID generator for the learning feature.
 * Uses crypto.randomUUID() (available in all modern browsers + Node ≥ 19).
 * Exported as named `crypto` re-export to avoid shadowing global.
 */

export function generateId(): string {
  return globalThis.crypto.randomUUID();
}

// Named re-export so submit-review.ts import compiles without unused-import lint
export const crypto = { generateId };

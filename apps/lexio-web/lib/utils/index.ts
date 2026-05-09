/**
 * lib/utils — re-exports shared utilities for use within lib/ adapters.
 *
 * Note: `cn` is canonically defined in shared/lib/utils.ts (ShadCN convention).
 * lib/ adapters that need it should import from @/shared/lib/utils directly
 * to avoid the boundaries plugin treating this as a lib→lib cross-import.
 * This barrel exists as a placeholder for future lib-specific utility functions.
 */
export type { ClassValue } from 'clsx';

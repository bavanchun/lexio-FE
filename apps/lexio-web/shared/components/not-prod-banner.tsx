'use client';

/**
 * NOT-PROD banner — slim top bar warning that stub auth is active.
 * Visible on all routes unless NEXT_PUBLIC_IS_PROTOTYPE is explicitly 'false'.
 * Height: h-7 to keep minimal vertical footprint.
 */
import { WarningIcon } from '@/shared/icons';

const isPrototype = process.env.NEXT_PUBLIC_IS_PROTOTYPE !== 'false';

export function NotProdBanner() {
  if (!isPrototype) return null;

  return (
    <div
      role="alert"
      className="flex h-7 items-center justify-center gap-1.5 border-b border-amber-500/30 bg-amber-500/10 px-4 text-xs font-medium text-amber-700 dark:text-amber-400"
    >
      <WarningIcon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      <span>Stub authentication — not for production</span>
    </div>
  );
}

'use client';

/**
 * OfflineIndicator — slim banner rendered below the NOT-PROD banner when
 * the browser loses network connectivity. Disappears automatically on reconnect.
 * Uses useOnlineStatus hook to react to window online/offline events.
 */
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/shared/hooks/use-online-status';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-7 items-center justify-center gap-1.5 border-b border-slate-500/30 bg-muted px-4 text-xs font-medium text-muted-foreground"
    >
      <WifiOff className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      <span>You&apos;re offline. Cached content available.</span>
    </div>
  );
}

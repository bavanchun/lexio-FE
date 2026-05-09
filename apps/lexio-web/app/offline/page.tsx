'use client';

/**
 * Offline fallback page — served by the service worker when a navigation
 * request fails due to no network and the route is not in the precache.
 *
 * Registered as a navigation fallback in app/sw.ts.
 */
import { WifiOff, RotateCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex max-w-sm flex-col items-center gap-6 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <WifiOff className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">You&apos;re offline</h1>
          <p className="text-sm text-muted-foreground">
            Lexio works without internet for cached pages and study sessions. Reconnect to sync your
            progress.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RotateCw className="h-4 w-4" strokeWidth={1.5} />
          Try again
        </Button>
      </div>
    </div>
  );
}

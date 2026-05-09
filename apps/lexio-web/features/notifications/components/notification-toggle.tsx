'use client';

/**
 * NotificationToggle — "Enable reminders" / "Disable reminders" button stub.
 * Calls subscribeToWebPush / unsubscribeFromWebPush from lib/push.
 *
 * STUB: subscription is not persisted to a backend server in this iteration.
 * Server-side push delivery comes with the .NET 10 Notification service in the next iteration.
 *
 * Renders as a DropdownMenuItem for use inside the TopBar avatar dropdown.
 */
import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { DropdownMenuItem } from '@/shared/components/ui/dropdown-menu';
import { subscribeToWebPush } from '@/lib/push/subscribe';
import { unsubscribeFromWebPush } from '@/lib/push/unsubscribe';

interface NotificationToggleProps {
  /** Called after the menu item action completes so parent can close dropdown. */
  onAction?: () => void;
}

export function NotificationToggle({ onAction }: NotificationToggleProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      if (subscribed) {
        const ok = await unsubscribeFromWebPush();
        if (ok) setSubscribed(false);
      } else {
        const sub = await subscribeToWebPush();
        if (sub) setSubscribed(true);
      }
    } catch (err) {
      console.error('[notifications] Toggle failed:', err);
    } finally {
      setLoading(false);
      onAction?.();
    }
  }

  const Icon = subscribed ? BellOff : Bell;
  const label = subscribed ? 'Disable reminders' : 'Enable reminders';

  return (
    <DropdownMenuItem onClick={handleToggle} disabled={loading} className="flex items-center gap-2">
      <Icon className="h-4 w-4" strokeWidth={1.5} />
      {label}
    </DropdownMenuItem>
  );
}

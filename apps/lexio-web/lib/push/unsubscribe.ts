/**
 * Web push unsubscribe stub.
 * Unsubscribes the active PushSubscription from the browser's PushManager.
 * Does NOT call a backend to deregister — deferred to the next iteration.
 */

/**
 * Unsubscribe from web push notifications.
 * Returns true if unsubscribed successfully or no subscription existed.
 * Returns false if service worker / PushManager not supported.
 */
export async function unsubscribeFromWebPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();

  if (!sub) return true;

  const unsubscribed = await sub.unsubscribe();

  if (unsubscribed) {
    // STUB: server-side deregistration not yet implemented.
    // TODO (next iteration): DELETE /api/push/register with sub.endpoint
    console.warn('[push] Unsubscribed locally but NOT deregistered on server (stub iteration).');
  }

  return unsubscribed;
}

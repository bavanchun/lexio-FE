/**
 * Web push subscription stub.
 *
 * STUB — no server-side push delivery in this iteration.
 * Real push delivery comes with the .NET 10 Notification service in the next iteration.
 * The PushSubscription object is returned but NOT posted to any backend.
 *
 * VAPID public key: NEXT_PUBLIC_VAPID_PUBLIC_KEY env var.
 * For prototype, set to a dummy string; subscription will be created locally only.
 */

/**
 * Convert a VAPID public key string (base64url) to a Uint8Array for
 * PushManager.subscribe applicationServerKey.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = globalThis.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/**
 * Request notification permission and subscribe to web push.
 *
 * Returns the PushSubscription on success, null if permission denied or
 * environment does not support push (e.g. non-HTTPS, iOS Safari < 16.4).
 *
 * NOTE: Subscription is not persisted to a backend in this iteration.
 * Callers may store the subscription object in Dexie `meta` for future sync.
 */
export async function subscribeToWebPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[push] Web push not supported in this environment.');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[push] Notification permission denied — subscription skipped.');
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const existingSub = await registration.pushManager.getSubscription();
  if (existingSub) return existingSub;

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    console.warn('[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set — subscription skipped.');
    return null;
  }

  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    // Cast to ArrayBuffer to satisfy strict lib type — Uint8Array is accepted at runtime
    applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
  });

  // STUB: subscription intentionally not posted to backend.
  // TODO (next iteration): POST sub.toJSON() to /api/push/register
  console.warn('[push] Subscription created but NOT persisted to server (stub iteration).');

  return sub;
}

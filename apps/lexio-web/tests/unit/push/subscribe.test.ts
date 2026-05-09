/**
 * Unit tests for lib/push/subscribe.ts
 *
 * NOTE: The service worker itself is not unit-testable here — it runs in a
 * worker context. Manual smoke testing is required via Chrome DevTools >
 * Application > Service Workers. This is documented in the phase-10 report.
 *
 * These tests mock navigator.serviceWorker, PushManager, and Notification
 * to exercise the subscribe logic in a jsdom environment.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { subscribeToWebPush } from '@/lib/push/subscribe';

// ---------- helpers ----------

function makePushSubscription(): PushSubscription {
  return {
    endpoint: 'https://push.example.com/stub',
    toJSON: () => ({ endpoint: 'https://push.example.com/stub', keys: {} }),
    unsubscribe: vi.fn().mockResolvedValue(true),
    getKey: vi.fn(),
    expirationTime: null,
    options: { applicationServerKey: null, userVisibleOnly: true },
  } as unknown as PushSubscription;
}

function makePushManager(
  existingSub: PushSubscription | null = null,
  newSub: PushSubscription = makePushSubscription(),
): PushManager {
  return {
    getSubscription: vi.fn().mockResolvedValue(existingSub),
    subscribe: vi.fn().mockResolvedValue(newSub),
    permissionState: vi.fn().mockResolvedValue('granted'),
  } as unknown as PushManager;
}

function makeServiceWorkerRegistration(pushManager: PushManager): ServiceWorkerRegistration {
  return { pushManager } as unknown as ServiceWorkerRegistration;
}

// ---------- tests ----------

describe('subscribeToWebPush', () => {
  const originalNavigator = global.navigator;
  const originalNotification = global.Notification;

  beforeEach(() => {
    // Reset env var
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'dGVzdC1rZXktZm9yLXVuaXQtdGVzdGluZw'; // valid base64url
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(global, 'navigator', { value: originalNavigator, writable: true });
    Object.defineProperty(global, 'Notification', { value: originalNotification, writable: true });
  });

  it('returns null when serviceWorker is not in navigator', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });
    const result = await subscribeToWebPush();
    expect(result).toBeNull();
  });

  it('returns null when Notification permission is denied', async () => {
    const pushManager = makePushManager();
    const registration = makeServiceWorkerRegistration(pushManager);

    Object.defineProperty(global, 'navigator', {
      value: {
        onLine: true,
        serviceWorker: {
          ready: Promise.resolve(registration),
        },
      },
      writable: true,
    });

    Object.defineProperty(global, 'Notification', {
      value: { requestPermission: vi.fn().mockResolvedValue('denied') },
      writable: true,
    });

    // PushManager must be in window for the guard to pass
    Object.defineProperty(global, 'PushManager', { value: {}, writable: true });

    const result = await subscribeToWebPush();
    expect(result).toBeNull();
  });

  it('returns existing subscription without calling subscribe again', async () => {
    const existingSub = makePushSubscription();
    const pushManager = makePushManager(existingSub);
    const registration = makeServiceWorkerRegistration(pushManager);

    Object.defineProperty(global, 'navigator', {
      value: {
        onLine: true,
        serviceWorker: { ready: Promise.resolve(registration) },
      },
      writable: true,
    });

    Object.defineProperty(global, 'Notification', {
      value: { requestPermission: vi.fn().mockResolvedValue('granted') },
      writable: true,
    });

    Object.defineProperty(global, 'PushManager', { value: {}, writable: true });

    const result = await subscribeToWebPush();
    expect(result).toBe(existingSub);
    expect(pushManager.subscribe).not.toHaveBeenCalled();
  });

  it('returns null when VAPID key is not set', async () => {
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    const pushManager = makePushManager(null);
    const registration = makeServiceWorkerRegistration(pushManager);

    Object.defineProperty(global, 'navigator', {
      value: {
        onLine: true,
        serviceWorker: { ready: Promise.resolve(registration) },
      },
      writable: true,
    });

    Object.defineProperty(global, 'Notification', {
      value: { requestPermission: vi.fn().mockResolvedValue('granted') },
      writable: true,
    });

    Object.defineProperty(global, 'PushManager', { value: {}, writable: true });

    const result = await subscribeToWebPush();
    expect(result).toBeNull();
  });

  it('creates and returns new subscription when none exists', async () => {
    const newSub = makePushSubscription();
    const pushManager = makePushManager(null, newSub);
    const registration = makeServiceWorkerRegistration(pushManager);

    Object.defineProperty(global, 'navigator', {
      value: {
        onLine: true,
        serviceWorker: { ready: Promise.resolve(registration) },
      },
      writable: true,
    });

    Object.defineProperty(global, 'Notification', {
      value: { requestPermission: vi.fn().mockResolvedValue('granted') },
      writable: true,
    });

    Object.defineProperty(global, 'PushManager', { value: {}, writable: true });

    const result = await subscribeToWebPush();
    expect(result).toBe(newSub);
    expect(pushManager.subscribe).toHaveBeenCalledOnce();
  });
});

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
    // Reset env var — use a 86+ char base64url string to pass the length guard.
    // This is a real-shape (but not cryptographically valid) VAPID public key for testing.
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY =
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
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

  it('returns null when VAPID key is shorter than 86 chars (stub/invalid key)', async () => {
    // "stub-key-not-real" is only 18 chars — should be rejected before subscribe()
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'stub-key-not-real';

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
    // subscribe() must NOT have been called — invalid key caught before the attempt
    expect(pushManager.subscribe).not.toHaveBeenCalled();
  });

  it('returns null when pushManager.subscribe() throws (server rejection / InvalidAccessError)', async () => {
    // Use a 86+ char key so the length guard passes, but subscribe rejects
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY =
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

    const pushManager = {
      getSubscription: vi.fn().mockResolvedValue(null),
      subscribe: vi.fn().mockRejectedValue(new DOMException('InvalidAccessError')),
      permissionState: vi.fn().mockResolvedValue('granted'),
    } as unknown as PushManager;

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

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await subscribeToWebPush();
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[push] Subscription failed'),
      expect.anything(),
    );
    warnSpy.mockRestore();
  });
});

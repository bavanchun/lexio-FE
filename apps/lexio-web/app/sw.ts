/**
 * Service worker entry — compiled by @serwist/next into public/sw.js.
 * Runs in worker context (no DOM, no React). Pure Serwist/Workbox.
 *
 * Offline fallback: any navigation to an uncached document returns /offline.
 * SW is disabled in dev (see next.config.ts disable: NODE_ENV === 'development').
 *
 * The `self` declaration overrides the default WindowOrWorkerGlobalScope so
 * Serwist can inject __SW_MANIFEST at build time. The `// @ts-ignore` on the
 * declare line is necessary because tsconfig targets the browser lib (no
 * ServiceWorkerGlobalScope); the service worker runs in a separate worker
 * context compiled by @serwist/next which provides the correct lib at runtime.
 */
import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const self: any & {
  __SW_MANIFEST: (string | { revision: string | null; url: string })[];
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();

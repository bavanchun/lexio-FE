# Phase 10 — PWA & offline

## Context links

- Doc §2.5 (PWA in scope), §5.1 (offline-to-sync delay)
- Research: researcher-c-report.md
- Depends on: phase-02 (theme tokens for manifest colors), phase-06 (shell)
- Unblocks: phase-11

## Overview

- **Priority:** P2
- **Status:** pending
- **Brief:** Wire Serwist for service worker + offline. App manifest with §12 brand colors. Web push subscription stub (no real delivery). Offline route. CSP headers.

## Key insights

- Use `@serwist/next` (Next 15-native) per researcher-c.
- Disable SW in dev to avoid HMR conflict.
- Push subscription is stub — store the PushSubscription object in Dexie meta for future sync; show button "Enable reminders".
- All data in IndexedDB → app already works offline once shell is cached.

## Requirements

**Functional:**

- After first load, going offline still allows: dashboard, decks, study, stats — everything.
- Add-to-home-screen prompt works on Android Chrome.
- Manifest theme_color = `#4F46E5` (Indigo 600); background_color = `#09090B` (dark default).
- Lighthouse PWA category passes installability checks.
- "Enable reminders" button → Notification permission → push subscribe (with throwaway VAPID public key in env). Subscription stored in `meta`.
- Offline page at `/offline` rendered when navigating to uncached route.

**NFR:**

- Service worker precaches < 500 KB total assets.
- Time to interactive (offline reload) < 1.5s.

## Architecture

- `app/sw.ts` — Serwist source.
- `app/manifest.ts` — Next 15 metadata route.
- `app/offline/page.tsx` — minimal page.
- `lib/push/subscribe.ts` — stub.
- `next.config.ts` — wrap with `withSerwist`.
- `app/layout.tsx` — add CSP-friendly meta tags.

## Related code files

**Create:**

- `apps/lexio-web/app/sw.ts`
- `apps/lexio-web/app/manifest.ts`
- `apps/lexio-web/app/offline/page.tsx`
- `apps/lexio-web/lib/push/subscribe.ts`
- `apps/lexio-web/lib/push/vapid-stub.ts`
- `apps/lexio-web/public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png`

**Modify:**

- `apps/lexio-web/next.config.ts` (wrap withSerwist)
- `apps/lexio-web/app/layout.tsx` (link manifest + CSP meta)
- `apps/lexio-web/features/auth/components/...` or sidebar settings — add "Enable reminders" stub button

## Implementation steps

1. `pnpm add -D @serwist/next serwist`. `pnpm add idb-keyval` (small util, optional).
2. Update `next.config.ts`:
   ```ts
   import withSerwistInit from '@serwist/next';
   const withSerwist = withSerwistInit({
     swSrc: 'app/sw.ts',
     swDest: 'public/sw.js',
     disable: process.env.NODE_ENV === 'development',
   });
   export default withSerwist({
     /* nextConfig */
   });
   ```
3. `app/sw.ts`:
   ```ts
   import { defaultCache } from '@serwist/next/worker';
   import { Serwist } from 'serwist';
   declare const self: ServiceWorkerGlobalScope & { __SW_MANIFEST: any };
   const serwist = new Serwist({
     precacheEntries: self.__SW_MANIFEST,
     skipWaiting: true,
     clientsClaim: true,
     navigationPreload: true,
     runtimeCaching: defaultCache,
     fallbacks: {
       entries: [{ url: '/offline', matcher: ({ request }) => request.destination === 'document' }],
     },
   });
   serwist.addEventListeners();
   ```
4. `app/manifest.ts`:
   ```ts
   import type { MetadataRoute } from 'next';
   export default function manifest(): MetadataRoute.Manifest {
     return {
       name: 'Lexio — Master vocabulary, the smart way.',
       short_name: 'Lexio',
       start_url: '/dashboard',
       display: 'standalone',
       theme_color: '#4F46E5',
       background_color: '#09090B',
       icons: [
         /* 192, 512, maskable */
       ],
     };
   }
   ```
5. `app/offline/page.tsx` — simple card with Lucide `WifiOff` + "You are offline. Lexio still works — try Decks or Study."
6. `lib/push/subscribe.ts`:
   ```ts
   export async function subscribePush(): Promise<PushSubscription | null> {
     if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
     const reg = await navigator.serviceWorker.ready;
     const perm = await Notification.requestPermission();
     if (perm !== 'granted') return null;
     const sub = await reg.pushManager.subscribe({
       userVisibleOnly: true,
       applicationServerKey: VAPID_STUB_PUBLIC_KEY,
     });
     await db.meta.put({ key: 'pushSubscription', value: sub.toJSON() });
     return sub;
   }
   ```
7. Add CSP via `next.config.ts` headers function. Strict-ish: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data:; connect-src 'self';`. Note `unsafe-inline` for styles is needed for next/font; consider nonce-based later.
8. Generate icon PNGs (placeholder — single-letter "L" Indigo 600 on Zinc 950 BG). Use ImageMagick or static stub.
9. Test: build → `pnpm start` → Chrome DevTools → Application → Service workers (registered) + Manifest (valid) + Offline mode → reload `/dashboard` works.

## Todo

- [ ] Serwist wired in next.config
- [ ] sw.ts with offline fallback
- [ ] manifest.ts with §12 colors
- [ ] /offline route
- [ ] Push subscribe stub + Dexie persist
- [ ] CSP headers
- [ ] Icons 192/512/maskable
- [ ] Lighthouse PWA passes

## Success criteria

- Lighthouse PWA category green.
- DevTools "Offline" → /dashboard still loads from cache.
- Manifest install prompt appears on Android.
- Push permission flow works in Chrome (no real push, just subscription stored).

## Risk assessment

| Risk                                         | Likelihood | Impact | Mitigation                                                  |
| -------------------------------------------- | ---------- | ------ | ----------------------------------------------------------- |
| SW caches stale build between deploys        | M          | M      | Skip waiting + clients claim; revisioned URLs from Next     |
| Workbox + Tailwind v4 CSS not precached      | L          | M      | Verify `__SW_MANIFEST` includes `/_next/static/*.css`       |
| Notification permission denied → silent fail | M          | L      | Toast: "Reminders unavailable. Enable in browser settings." |

## Security considerations

- CSP defined; review for inline-script reliance (Next.js sometimes inlines).
- Push: NEVER send sensitive content in payload; for prototype, no real delivery.
- VAPID stub key is public — clearly mark as non-prod in `vapid-stub.ts`.

## Next steps

Phase 11 adds Lighthouse CI gating ≥95.

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from '@serwist/next';

/**
 * next-intl v4 plugin wires the request config at i18n/request.ts.
 * Using "without i18n routing" mode — single 'en' locale, no [locale] segment.
 * Doc: https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing
 */
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/**
 * Serwist service worker plugin.
 * SW is disabled in development to avoid HMR conflicts.
 * Build artifact (public/sw.js) is gitignored.
 */
const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

/**
 * Content Security Policy headers.
 *
 * SECURITY NOTE: 'unsafe-inline' for script-src and style-src is required by
 * next/font for inline style injection. Nonce-based CSP is deferred to a future
 * iteration when the backend is in place (CSP nonce generation requires server context).
 *
 * worker-src blob: is required for Serwist service worker registration.
 */
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://fonts.gstatic.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default withSerwist(withNextIntl(nextConfig));

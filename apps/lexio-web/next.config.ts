import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from '@serwist/next';
import withBundleAnalyzerInit from '@next/bundle-analyzer';

/**
 * next-intl v4 plugin wires the request config at i18n/request.ts.
 * Using "without i18n routing" mode — single 'en' locale, no [locale] segment.
 * Doc: https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing
 */
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/**
 * Bundle analyzer — enabled only when ANALYZE=true env var is set.
 * Usage: ANALYZE=true pnpm build
 * Output: .next/analyze/client.html and server.html
 */
const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === 'true',
});

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
 * 'unsafe-eval' is added to script-src in development only — React/Turbopack uses
 * eval() in dev for source-map reconstruction and HMR. Production builds never use eval.
 *
 * worker-src blob: is required for Serwist service worker registration.
 */
const isDev = process.env.NODE_ENV === 'development';
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const cspHeader = [
  "default-src 'self'",
  scriptSrc,
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

export default withSerwist(withBundleAnalyzer(withNextIntl(nextConfig)));

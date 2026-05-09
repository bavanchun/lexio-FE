import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * next-intl v4 plugin wires the request config at i18n/request.ts.
 * Using "without i18n routing" mode — single 'en' locale, no [locale] segment.
 * Doc: https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing
 */
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);

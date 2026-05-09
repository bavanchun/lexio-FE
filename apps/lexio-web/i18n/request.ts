/**
 * next-intl v4 request config for Next.js App Router (without i18n routing).
 * Placed at apps/lexio-web/i18n/request.ts per next-intl v4 convention.
 * Loaded server-side per request via next-intl plugin.
 */

import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from '@/lib/i18n/locale';

export default getRequestConfig(async () => {
  const locale = defaultLocale;

  return {
    locale,
    messages: (await import(`../lib/i18n/messages/${locale}.json`)).default,
  };
});

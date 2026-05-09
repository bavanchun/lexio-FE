/**
 * next-intl request config for App Router.
 * Called per-request on the server to resolve the locale and load messages.
 * Doc: https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing
 */

import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './locale';

export default getRequestConfig(async () => {
  const locale = defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

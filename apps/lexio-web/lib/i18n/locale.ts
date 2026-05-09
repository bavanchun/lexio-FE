/**
 * Supported locales for Lexio.
 * Only 'en' is active in the prototype. Vietnamese ('vi') is structurally
 * ready — add it here and provide lib/i18n/messages/vi.json to enable.
 */

export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

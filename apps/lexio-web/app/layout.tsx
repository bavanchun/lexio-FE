import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { inter, jetbrainsMono, charisSil } from '@/shared/fonts';
import { ThemeProvider } from '@/shared/theme/theme-provider';
import { Toaster } from '@/shared/components/ui/sonner';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lexio — Language learning, reimagined',
  description: 'Learn vocabulary with spaced repetition and IPA pronunciation.',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    /*
     * suppressHydrationWarning prevents React from warning about the `class`
     * attribute mismatch caused by next-themes injecting the theme class
     * before hydration. Required per next-themes docs.
     *
     * Font CSS variables are set on <html> so they cascade to all children.
     * --font-ipa now points to self-hosted Charis SIL woff2 (phase-03).
     */
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${charisSil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

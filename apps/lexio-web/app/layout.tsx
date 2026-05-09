import type { Metadata } from 'next';
import { inter, jetbrainsMono } from '@/shared/fonts';
import { ThemeProvider } from '@/shared/theme/theme-provider';
import { Toaster } from '@/shared/components/ui/sonner';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lexio — Language learning, reimagined',
  description: 'Learn vocabulary with spaced repetition and IPA pronunciation.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
     * suppressHydrationWarning prevents React from warning about the `class`
     * attribute mismatch caused by next-themes injecting the theme class
     * before hydration. Required per next-themes docs.
     *
     * Font CSS variables are set on <html> so they cascade to all children.
     * --font-ipa falls back to system serif until Charis SIL woff2 is
     * self-hosted in phase-09.
     */
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={{ fontFamily: 'var(--font-ipa, serif)' } as React.CSSProperties}
    >
      <head>
        {/* Declare --font-ipa CSS variable for IPA spans until phase-09 */}
        <style>{`:root { --font-ipa: serif; }`}</style>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

/**
 * Font definitions for Lexio — doc §12.3
 *
 * Inter       → primary UI font (weights 400/500/600)
 * JetBrains Mono → code blocks
 * Charis SIL  → IPA notation only
 *   Note: Charis SIL is NOT available on Google Fonts as of 2026-05.
 *   Fallback: system serif until local woff2 self-hosting is set up in a
 *   future phase. The CSS variable --font-ipa is still declared so IPA spans
 *   render distinctly; the actual glyph coverage depends on the user's system
 *   serif stack (e.g. Times New Roman, Georgia) which covers basic IPA.
 *   Full self-hosting via next/font/local + CharisSIL-Regular.woff2 is
 *   tracked as a follow-up task for phase-09 (font optimization).
 */
import { Inter, JetBrains_Mono } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

/**
 * Charis SIL is not on Google Fonts. We declare the CSS variable with a
 * system-serif fallback so IPA components still visually differentiate from
 * body text. Self-hosting the actual font files is deferred to phase-09.
 */
export const FONT_IPA_VARIABLE = '--font-ipa';
export const FONT_IPA_FALLBACK = 'serif'; // replaced by Charis SIL woff2 in phase-09

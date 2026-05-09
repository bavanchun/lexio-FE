/**
 * Font definitions for Lexio — doc §12.3
 *
 * Inter          → primary UI font (weights 400/500/600)
 * JetBrains Mono → code blocks
 * Charis SIL     → IPA notation only (self-hosted woff2, phase-03)
 *
 * All fonts are loaded via next/font to guarantee zero layout shift and
 * automatic font subsetting/preloading. CSS variables are declared on <html>
 * so they cascade to all children without prop drilling.
 */
import { Inter, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';

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
 * Charis SIL Regular — full IPA glyph coverage including tone letters,
 * diacritics, and rare phonetic characters not available in system fonts.
 * Source: https://software.sil.org/charis/ (SIL Open Font License 1.1)
 * File: public/fonts/CharisSIL-Regular.woff2 (293 KB, committed to repo)
 */
export const charisSil = localFont({
  src: '../public/fonts/CharisSIL-Regular.woff2',
  variable: '--font-ipa',
  display: 'swap',
  // weight not specified — single regular weight file
});

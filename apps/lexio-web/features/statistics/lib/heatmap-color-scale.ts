/**
 * Heatmap color scale — maps daily review counts to hex colors.
 * Monochromatic Zinc→Indigo per §12.5 rule 8 and §4.4.3 (5 intensity buckets).
 *
 * Uses inline hex values (NOT Tailwind arbitrary values) so dark-mode hex swaps
 * work correctly without Tailwind v4 needing to generate dark-variant classes
 * for non-standard indigo shades.
 */

export type ColorMode = 'light' | 'dark';

/** 0-based bucket index (0 = no activity, 4 = most active). */
export type IntensityBucket = 0 | 1 | 2 | 3 | 4;

/** Classify a daily review count into one of 5 intensity buckets. */
export function getIntensityBucket(count: number): IntensityBucket {
  if (count === 0) return 0;
  if (count <= 10) return 1;
  if (count <= 30) return 2;
  if (count <= 100) return 3;
  return 4;
}

/**
 * Hex colors for each intensity bucket.
 *
 * Light mode:  zinc-200 → indigo-200 → indigo-400 → indigo-500 → indigo-700
 * Dark mode:   zinc-800 → indigo-900 → indigo-700 → indigo-500 → indigo-300
 */
const COLORS: Record<ColorMode, [string, string, string, string, string]> = {
  light: ['#e4e4e7', '#c7d2fe', '#818cf8', '#6366f1', '#4338ca'],
  dark: ['#27272a', '#312e81', '#4338ca', '#6366f1', '#a5b4fc'],
};

/** Return the hex background color for a given count and color mode. */
export function heatmapColor(count: number, mode: ColorMode): string {
  const bucket = getIntensityBucket(count);
  return COLORS[mode][bucket];
}

/** Return the data-intensity attribute value (string "0"–"4") for testability. */
export function heatmapIntensity(count: number): string {
  return String(getIntensityBucket(count));
}

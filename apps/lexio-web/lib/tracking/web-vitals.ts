/**
 * web-vitals.ts — reports Core Web Vitals to console (prototype).
 *
 * Uses next/web-vitals (re-exports web-vitals v4 under the hood).
 * In production this should send to a real analytics endpoint.
 *
 * Metrics reported: CLS, LCP, INP (replaces FID in v4), FCP, TTFB.
 *
 * Wire-up: call reportWebVitals() from useReportWebVitals() in layout.tsx.
 */
import type { NextWebVitalsMetric } from 'next/app';

/**
 * Logs a Web Vitals metric to the console.
 * Replace console.log with a POST to /api/vitals for production telemetry.
 */
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  if (process.env.NODE_ENV === 'production') {
    // Production: would POST to analytics endpoint.
    // Kept as console for prototype — no backend yet.
    console.info('[web-vitals]', metric.name, Math.round(metric.value));
  } else {
    // Development: verbose output for debugging.
    console.debug('[web-vitals]', {
      name: metric.name,
      value: Math.round(metric.value),
      id: metric.id,
    });
  }
}

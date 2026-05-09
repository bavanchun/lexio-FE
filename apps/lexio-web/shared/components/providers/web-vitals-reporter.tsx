'use client';

/**
 * WebVitalsReporter — thin client component that hooks into Next.js web-vitals.
 * Renders nothing; exists only to call useReportWebVitals() in a client boundary.
 * Mounted once in RootLayout. Prototype: logs to console. Swap reportWebVitals
 * implementation for a real endpoint before shipping to production.
 */
import { useReportWebVitals } from 'next/web-vitals';

import { reportWebVitals } from '@/lib/tracking/web-vitals';

export function WebVitalsReporter() {
  useReportWebVitals(reportWebVitals);
  return null;
}

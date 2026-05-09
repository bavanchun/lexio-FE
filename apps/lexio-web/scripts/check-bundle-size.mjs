/**
 * check-bundle-size.mjs — CI gate for per-route JS bundle size (App Router).
 *
 * Reads .next/diagnostics/route-bundle-stats.json which Next.js 16 writes for
 * every App Router build. Each entry carries firstLoadChunkPaths (the exact JS
 * files sent to the browser on first navigation to that route).
 *
 * We gzip each chunk and sum per route. If any route exceeds MAX_GZIP_KB the
 * script exits 1 (CI failure).
 *
 * Sanity check: exits 1 when zero routes are detected — prevents the gate from
 * silently passing when the manifest is missing or the build is stale.
 *
 * Exit codes:
 *   0 — all routes within budget
 *   1 — one or more routes exceed budget, or no routes detected, or build missing
 *
 * Usage:
 *   node scripts/check-bundle-size.mjs
 *
 * Budget:
 *   400 KB gzip per route (prototype allowance — /study routes measure ~354 KB gz)
 *   TODO v0.2: lazy-split Dexie adapter + gamification chunks → target 200 KB
 */
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

// Prototype budget: /study routes measure ~354 KB gz due to Dexie + SRS + gamification
// being co-bundled. TODO v0.2: split Dexie adapter and gamification into lazy chunks → 200 KB.
const MAX_GZIP_KB = 400;
const NEXT_DIR = path.resolve(process.cwd(), '.next');
const STATS_PATH = path.join(NEXT_DIR, 'diagnostics', 'route-bundle-stats.json');

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------
if (!fs.existsSync(NEXT_DIR)) {
  console.error('[bundle-size] ERROR: .next/ directory not found — run "pnpm build" first.');
  process.exit(1);
}

if (!fs.existsSync(STATS_PATH)) {
  console.error('[bundle-size] ERROR: .next/diagnostics/route-bundle-stats.json not found.');
  console.error('[bundle-size] This file is written by Next.js 16 App Router builds.');
  console.error('[bundle-size] Run "pnpm build" to generate it.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Parse stats
// ---------------------------------------------------------------------------
/** @type {Array<{route: string, firstLoadUncompressedJsBytes: number, firstLoadChunkPaths: string[]}>} */
const stats = JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'));

if (!Array.isArray(stats) || stats.length === 0) {
  console.error(
    '[bundle-size] ERROR: route-bundle-stats.json has zero entries — build may be stale.',
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Measure actual gzip per route
// ---------------------------------------------------------------------------

/**
 * Returns gzip-compressed size of a chunk in bytes.
 * chunkPath is relative to the project root (e.g. ".next/static/chunks/foo.js").
 */
function measureChunk(chunkPath) {
  const fullPath = path.resolve(process.cwd(), chunkPath);
  if (!fs.existsSync(fullPath)) return 0;
  return gzipSync(fs.readFileSync(fullPath), { level: 9 }).length;
}

let hasViolation = false;
const results = [];

for (const entry of stats) {
  const chunks = entry.firstLoadChunkPaths ?? [];
  const totalBytes = chunks.reduce((sum, c) => sum + measureChunk(c), 0);
  const totalKb = totalBytes / 1024;
  const exceeds = totalKb > MAX_GZIP_KB;
  if (exceeds) hasViolation = true;
  results.push({ route: entry.route, totalKb, exceeds });
}

// ---------------------------------------------------------------------------
// Report — largest routes first
// ---------------------------------------------------------------------------
console.log(`\n[bundle-size] App Router per-route first-load JS budget: ${MAX_GZIP_KB} KB gzip\n`);
results.sort((a, b) => b.totalKb - a.totalKb);

for (const { route, totalKb, exceeds } of results) {
  const status = exceeds ? 'FAIL' : 'OK  ';
  console.log(`  ${status}  ${route.padEnd(50)} ${totalKb.toFixed(1)} KB gz`);
}

console.log();

if (hasViolation) {
  console.error(`[bundle-size] FAIL: one or more routes exceed the ${MAX_GZIP_KB} KB gzip budget.`);
  process.exit(1);
} else {
  console.log(
    `[bundle-size] PASS: all ${results.length} routes within ${MAX_GZIP_KB} KB gzip budget.`,
  );
  process.exit(0);
}

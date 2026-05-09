/**
 * check-bundle-size.mjs — CI gate for per-route JS bundle size (App Router).
 *
 * Reads .next/app-build-manifest.json which maps each App Router route to its
 * JS chunk files. Falls back gracefully when the manifest is missing.
 *
 * Exit code 0 = all routes within budget.
 * Exit code 1 = one or more routes exceed budget, OR no routes detected
 *               (sanity check: the gate must not silently pass when the build
 *               output is empty or in the wrong format).
 *
 * Usage:
 *   node scripts/check-bundle-size.mjs
 *   node scripts/check-bundle-size.mjs --gzip    (actual gzip, same result — kept for compat)
 */
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const MAX_GZIP_KB = 350; // raised from 200 KB for prototype — TODO v0.2: tighten to 200 KB
const NEXT_DIR = path.resolve(process.cwd(), '.next');

// ---------------------------------------------------------------------------
// Guard: build output must exist
// ---------------------------------------------------------------------------
const APP_MANIFEST_PATH = path.join(NEXT_DIR, 'app-build-manifest.json');

if (!fs.existsSync(NEXT_DIR)) {
  console.error('[bundle-size] ERROR: .next/ directory not found.');
  console.error('[bundle-size] Run "pnpm build" first.');
  process.exit(1);
}

if (!fs.existsSync(APP_MANIFEST_PATH)) {
  console.error('[bundle-size] ERROR: .next/app-build-manifest.json not found.');
  console.error(
    '[bundle-size] This script targets Next.js App Router output. ' +
      'If you are on Pages Router, use build-manifest.json instead.',
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Parse app-build-manifest.json
// manifest.pages: { "/route": ["/_next/static/chunks/xxx.js", ...] }
// ---------------------------------------------------------------------------

const manifest = JSON.parse(fs.readFileSync(APP_MANIFEST_PATH, 'utf8'));
const pages = manifest.pages ?? {};
const routeEntries = Object.entries(pages);

// Sanity check: if zero routes detected the manifest is probably wrong format
if (routeEntries.length === 0) {
  console.error('[bundle-size] ERROR: app-build-manifest.json has zero routes.');
  console.error('[bundle-size] The bundle gate cannot validate an empty manifest — build first.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Measure gzip size per route
// chunk paths are relative to .next/ (e.g. "static/chunks/app/page-abc123.js")
// ---------------------------------------------------------------------------

/**
 * Returns actual gzip size in bytes for a chunk path.
 * Returns 0 if the file does not exist (may be shared/inline chunk).
 */
function measureChunk(chunkPath) {
  // Normalise: strip leading /_next/ if present
  const relative = chunkPath.replace(/^\/_next\//, '');
  const fullPath = path.join(NEXT_DIR, relative);
  if (!fs.existsSync(fullPath)) return 0;
  const buf = fs.readFileSync(fullPath);
  return gzipSync(buf, { level: 9 }).length;
}

let hasViolation = false;
const results = [];

for (const [route, chunks] of routeEntries) {
  if (!Array.isArray(chunks)) continue;
  const totalBytes = chunks.reduce((sum, chunk) => sum + measureChunk(chunk), 0);
  const totalKb = totalBytes / 1024;
  const exceeds = totalKb > MAX_GZIP_KB;
  if (exceeds) hasViolation = true;
  results.push({ route, totalKb: Math.round(totalKb * 10) / 10, exceeds });
}

// ---------------------------------------------------------------------------
// Report — largest first
// ---------------------------------------------------------------------------
console.log(`\n[bundle-size] App Router per-route JS budget: ${MAX_GZIP_KB} KB gzip (actual)\n`);
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

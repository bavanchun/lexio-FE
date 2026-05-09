/**
 * check-bundle-size.mjs — CI gate for per-route JS bundle size.
 *
 * Reads .next/build-manifest.json to enumerate all JS chunks per page route.
 * Reads .next/static/chunks/*.js to get file sizes.
 * Fails (exit 1) if any route's total gzipped JS exceeds MAX_GZIP_KB.
 *
 * KISS approach: Next.js build-manifest maps pages → chunk filenames.
 * We read raw file sizes and apply a ~0.35 gzip estimation ratio.
 * For accurate gzip, pass --gzip flag (requires zlib, slower).
 *
 * Usage:
 *   node scripts/check-bundle-size.mjs
 *   node scripts/check-bundle-size.mjs --gzip    (accurate, slower)
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const MAX_GZIP_KB = 200;
const GZIP_ESTIMATE_RATIO = 0.35; // conservative estimate for minified JS

const useActualGzip = process.argv.includes('--gzip');
const nextDir = path.resolve(process.cwd(), '.next');
const manifestPath = path.join(nextDir, 'build-manifest.json');

// ---------------------------------------------------------------------------
// Guard: build output must exist
// ---------------------------------------------------------------------------
if (!fs.existsSync(manifestPath)) {
  console.error('[bundle-size] ERROR: .next/build-manifest.json not found.');
  console.error('[bundle-size] Run "pnpm build" first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// ---------------------------------------------------------------------------
// Collect all page routes and their JS chunks
// ---------------------------------------------------------------------------
const pages = manifest.pages ?? {};

/**
 * Returns gzip size in bytes for a given chunk filename.
 * Falls back to 0 if file not found (chunk may be CDN-hosted or missing).
 */
function getGzipSize(chunkPath) {
  const filePath = path.join(nextDir, 'static', chunkPath.replace(/^\/_next\/static\//, ''));
  if (!fs.existsSync(filePath)) return 0;

  const raw = fs.readFileSync(filePath);

  if (useActualGzip) {
    return zlib.gzipSync(raw, { level: 9 }).length;
  }
  // Estimate: minified JS typically compresses to ~35% of raw size
  return Math.round(raw.length * GZIP_ESTIMATE_RATIO);
}

// ---------------------------------------------------------------------------
// Evaluate each route
// ---------------------------------------------------------------------------
let hasViolation = false;
const results = [];

for (const [route, chunks] of Object.entries(pages)) {
  if (!Array.isArray(chunks)) continue;

  const totalBytes = chunks.reduce((sum, chunk) => sum + getGzipSize(chunk), 0);
  const totalKb = totalBytes / 1024;
  const exceeds = totalKb > MAX_GZIP_KB;

  if (exceeds) hasViolation = true;

  results.push({ route, totalKb: Math.round(totalKb), exceeds });
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const method = useActualGzip ? 'actual gzip' : `estimated gzip (~${GZIP_ESTIMATE_RATIO * 100}%)`;
console.log(`\n[bundle-size] Per-route JS budget: ${MAX_GZIP_KB} KB (${method})\n`);

// Sort largest first for easy scanning
results.sort((a, b) => b.totalKb - a.totalKb);

for (const { route, totalKb, exceeds } of results) {
  const status = exceeds ? 'EXCEEDS' : 'OK';
  console.log(`  ${status.padEnd(10)} ${String(totalKb).padStart(6)} KB  ${route}`);
}

console.log();

if (hasViolation) {
  console.error(`[bundle-size] FAIL: one or more routes exceed the ${MAX_GZIP_KB} KB gzip budget.`);
  process.exit(1);
} else {
  console.log(`[bundle-size] PASS: all routes within ${MAX_GZIP_KB} KB gzip budget.`);
  process.exit(0);
}

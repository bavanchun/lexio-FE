/**
 * E2E happy-path — hero flow: login → dashboard → study 5 cards → streak.
 *
 * Auth: injects Zustand persist state into localStorage before navigation.
 * DB:   Dexie (IndexedDB) is cleared via storageState reset before each test.
 * Browser: chromium only (prototype scope).
 */
import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Injects a stub auth user matching STUB_USER_ID from seed-loader.ts. */
async function injectAuthState(
  page: import('@playwright/test').Page,
  email = 'test@lexio.app',
  displayName = 'Test User',
) {
  const now = new Date().toISOString();
  const stubUser = {
    id: 'stub-user-000', // matches STUB_USER_ID in seed-loader
    email,
    displayName,
    role: 'Learner',
    isVerified: false,
    createdAt: now,
    lastLoginAt: now,
  };

  // Zustand persist key: 'lexio-auth-stub'
  await page.addInitScript((user) => {
    const state = { state: { user, _hasHydrated: true }, version: 0 };
    localStorage.setItem('lexio-auth-stub', JSON.stringify(state));
  }, stubUser);
}

/** Wait for the DB/seed init indicator — DbInitProvider sets data-db-status. */
async function waitForDbReady(page: import('@playwright/test').Page) {
  // DbInitProvider renders children once seeding is done.
  // We wait for the TodayCard "Due for review" text to appear as a proxy.
  await page.waitForSelector('text=Due for review', { timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Happy path — login to study to streak', () => {
  test('visit / redirects to /login when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('fill login form → lands on /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@lexio.app');
    await page.fill('input[type="text"]', 'Test User');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/dashboard/i);
  });

  test('NOT-PROD banner is visible on dashboard', async ({ page }) => {
    await injectAuthState(page);
    await page.goto('/dashboard');
    await expect(page.getByText(/stub authentication/i)).toBeVisible();
  });

  test('full hero flow: study 5 cards → streak = 1', async ({ page }) => {
    // Inject auth — uses stub-user-000 which matches the seeded data.
    await injectAuthState(page);
    await page.goto('/dashboard');

    // Wait for DB seed to complete (TodayCard visible).
    await waitForDbReady(page);

    // Seed loads 30 cards all due — verify due count is visible.
    await expect(page.getByText('30')).toBeVisible({ timeout: 10_000 });

    // Click "Start studying" CTA in TodayCard.
    await page.getByRole('button', { name: /start studying/i }).click();

    // Should be on a study route (/study/new?deckId=... or /study/[id]).
    await expect(page).toHaveURL(/\/study/, { timeout: 10_000 });

    // Wait for first card to load (SessionProgress text visible).
    await page.waitForSelector('text=1 / ', { timeout: 10_000 });

    // Flip and rate 5 cards with Space + "3" (Good).
    for (let i = 0; i < 5; i++) {
      // Press Space to flip card.
      await page.keyboard.press('Space');
      // Wait for flip animation (200ms) + a bit more for DOM update.
      await page.waitForTimeout(300);
      // Press "3" to rate Good.
      await page.keyboard.press('3');
      // Wait for submit + next card to load.
      await page.waitForTimeout(300);
    }

    // After 5 reviews either show session summary or next card.
    // Navigate back to dashboard to check streak.
    await page.goto('/dashboard');
    await waitForDbReady(page);

    // StreakCard should show current streak ≥ 1.
    // StreakCard renders: "<number> days" — after studying streak = 1.
    const streakNumber = page.locator('text=Day streak').locator('..').getByText(/^\d+$/);
    const streakText = await streakNumber.textContent({ timeout: 8_000 });
    expect(Number(streakText)).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Smoke tests
// ---------------------------------------------------------------------------

test.describe('Smoke tests', () => {
  test('/design showcase renders without error', async ({ page }) => {
    await page.goto('/design');
    // Design page has no auth guard — it renders a standalone layout.
    await expect(page.getByRole('heading', { name: /design/i })).toBeVisible({ timeout: 10_000 });
    // Color swatches section heading.
    await expect(page.getByText(/color/i).first()).toBeVisible();
  });

  test('/decks renders deck card with auth', async ({ page }) => {
    await injectAuthState(page);
    await page.goto('/decks');
    // Wait for deck list to load — seed creates 1 deck.
    await page.waitForSelector('[role="link"]', { timeout: 15_000 });
    const deckLinks = page.locator('[role="link"]');
    await expect(deckLinks.first()).toBeVisible();
  });
});

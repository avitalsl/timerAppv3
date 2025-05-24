import { test, expect } from '@playwright/test';

/**
 * E2E Responsive Sidebar Tests
 *
 * This test suite verifies that the Sidebar component responds correctly to the custom breakpoints:
 * - Standard: ≥1200px (sb-compact)
 * - Compact: 900px–1199px (sb-mobile to sb-compact)
 * - Mobile: <900px (below sb-mobile)
 *
 * The Sidebar is selected by data-testid="component-sidebar".
 *
 * NOTE: This assumes the Sidebar is always visible on the main layout route (e.g., '/').
 */

test.describe('Sidebar Responsive Breakpoints', () => {
  const sidebarTestId = '[data-testid="component-sidebar"]';

  test('Sidebar is in desktop state at ≥1200px', async ({ page }) => {
    await page.setViewportSize({ width: 1300, height: 900 });
    await page.goto('/');
    const sidebar = await page.locator(sidebarTestId);
    await expect(sidebar).toBeVisible();
    // Desktop width: Tailwind's desktop:w-56 (14rem = 224px)
    await expect(sidebar).toHaveCSS('width', '224px');
  });

  test('Sidebar is in tablet state at 900–1199px', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 900 });
    await page.goto('/');
    const sidebar = await page.locator(sidebarTestId);
    await expect(sidebar).toBeVisible();
    // Tablet width: Tailwind's tablet:w-52 (13rem = 208px)
    await expect(sidebar).toHaveCSS('width', '208px');
  });

  test('Sidebar is in mobile state at <900px', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto('/');
    const sidebar = await page.locator(sidebarTestId);
    await expect(sidebar).toBeVisible();
    // Mobile width: Tailwind's w-16 (4rem = 64px)
    await expect(sidebar).toHaveCSS('width', '64px');
  });
});

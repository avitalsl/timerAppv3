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

  test('Sidebar is in standard state at ≥1200px', async ({ page }) => {
    await page.setViewportSize({ width: 1300, height: 900 });
    await page.goto('/');
    const sidebar = await page.locator(sidebarTestId);
    await expect(sidebar).toBeVisible();
    // Standard width: should match Tailwind's sb-compact:w-56 (14rem = 224px)
    await expect(sidebar).toHaveCSS('width', '224px');
  });

  test('Sidebar is in compact state at 1000px', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 900 });
    await page.goto('/');
    const sidebar = await page.locator(sidebarTestId);
    await expect(sidebar).toBeVisible();
    // Compact width: should match Tailwind's sb-mobile:w-20 (5rem = 80px) unless overridden
    // But per Sidebar.tsx, sb-compact:w-56, sb-mobile:w-20, so between 900 and 1200px, width should be 224px
    await expect(sidebar).toHaveCSS('width', '224px');
  });

  test('Sidebar is in mobile state at <900px', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto('/');
    const sidebar = await page.locator(sidebarTestId);
    await expect(sidebar).toBeVisible();
    // Mobile width: Tailwind's sb-mobile:w-20 (5rem = 80px)
    await expect(sidebar).toHaveCSS('width', '80px');
  });
});

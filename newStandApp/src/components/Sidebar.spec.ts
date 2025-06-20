import { test, expect } from '@playwright/test';
import { clearAppStorage } from '../services/tests/mockStorageForTests';

// Helper to directly update the MeetingContext state
async function updateSelectedComponents(page: any, componentIds: string[]): Promise<boolean> {
  return page.evaluate((ids: string[]) => {
    // Access the MeetingContext dispatch function
    const dispatchEvent = new CustomEvent('updateSelectedComponents', { detail: ids });
    window.dispatchEvent(dispatchEvent);
    return true;
  }, componentIds);
}

test.describe('Dynamic Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the setup screen first
    await page.goto('/');
    // Then clear any existing storage data
    await clearAppStorage(page);
  });

  test('should only show default links initially', async ({ page }) => {
    // Check that default links are visible
    await expect(page.getByTestId('sidebar-nav-link-home')).toBeVisible();
    
    // Check that feature-specific links are not visible
    await expect(page.getByTestId('sidebar-nav-link-participants')).not.toBeVisible();
    await expect(page.getByTestId('sidebar-nav-link-links')).not.toBeVisible();
  });

  test('should show participants link when participants feature is selected', async ({ page }) => {
    // First, navigate to the page
    await page.goto('/');
    
    // Directly update the MeetingContext state
    await updateSelectedComponents(page, ['timer', 'participants']);
    
    // Wait for the UI to update
    await page.waitForTimeout(500);
    
    // Check that participants link appears in sidebar
    await expect(page.getByTestId('sidebar-nav-link-participants')).toBeVisible();
  });

  test('should remove links link when links feature is deselected', async ({ page }) => {
    // First, navigate to the page
    await page.goto('/');
    
    // Directly update the MeetingContext state to include links
    await updateSelectedComponents(page, ['timer', 'links']);
    
    // Wait for the UI to update
    await page.waitForTimeout(500);
    
    // Verify links link is visible
    await expect(page.getByTestId('sidebar-nav-link-links')).toBeVisible();
    
    // Update the MeetingContext state to remove links
    await updateSelectedComponents(page, ['timer']);
    
    // Wait for the UI to update
    await page.waitForTimeout(500);
    
    // Verify links link is no longer visible
    await expect(page.getByTestId('sidebar-nav-link-links')).not.toBeVisible();
  });

  test('should navigate to feature page when sidebar link is clicked', async ({ page }) => {
    // First, navigate to the page
    await page.goto('/');
    
    // Directly update the MeetingContext state
    await updateSelectedComponents(page, ['timer', 'participants']);
    
    // Wait for the UI to update
    await page.waitForTimeout(500);
    
    // Click on the participants link
    await page.getByTestId('sidebar-nav-link-participants').click();
    
    // Verify navigation to participants page
    await expect(page).toHaveURL(/.*\/participants/);
  });
});

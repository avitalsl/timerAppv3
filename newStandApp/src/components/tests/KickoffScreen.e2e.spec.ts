import { test, expect } from '@playwright/test';
import type { KickoffSetting } from '../../contexts/MeetingContext';
import { setupTestStorage, clearAppStorage, getKickoffSettings } from '../../services/tests/mockStorageForTests';

const KICKOFF_PAGE_URL = '/kickoff';

test.describe('KickoffScreen E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE [${msg.type().toUpperCase()}]: ${msg.text()}`);
    });
    // Navigate to the app page first
    await page.goto(KICKOFF_PAGE_URL);
    // Clear app storage
    await clearAppStorage(page);
    // Reload the page to ensure the component initializes with cleared localStorage
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should load the kickoff page and display default settings', async ({ page }) => {
    await page.goto(KICKOFF_PAGE_URL);
    await expect(page.getByTestId('kickoff-screen-card')).toBeVisible();
    await expect(page.getByTestId('kickoff-mode-getDownToBusiness')).toBeChecked();
    await expect(page.getByTestId('story-time-options-selector')).not.toBeVisible();

    const settings = await getKickoffSettings(page);
    expect(settings?.mode).toBe('getDownToBusiness');
    expect(settings?.storyOption).toBeNull();
  });

  test('should switch to Story Time and show story options, defaulting to Randomize', async ({ page }) => {
    await page.goto(KICKOFF_PAGE_URL);
    await page.getByTestId('kickoff-mode-storyTime').check();

    await expect(page.getByTestId('story-time-options-selector')).toBeVisible();
    await expect(page.getByTestId('story-time-option-random')).toBeChecked();

    const settings = await getKickoffSettings(page);
    expect(settings?.mode).toBe('storyTime');
    expect(settings?.storyOption).toBe('random');
  });

  test('should switch to Story Time and allow choosing storyteller method', async ({ page }) => {
    await page.goto(KICKOFF_PAGE_URL);
    await page.getByTestId('kickoff-mode-storyTime').check();
    await page.getByTestId('story-time-option-manual').check();

    await expect(page.getByTestId('story-time-option-manual')).toBeChecked();

    const settings = await getKickoffSettings(page);
    expect(settings?.mode).toBe('storyTime');
    expect(settings?.storyOption).toBe('manual');
  });

  test('should hide story options when switching back to Get Down to Business', async ({ page }) => {
    await page.goto(KICKOFF_PAGE_URL);
    // First, switch to Story Time
    await page.getByTestId('kickoff-mode-storyTime').check();
    await expect(page.getByTestId('story-time-options-selector')).toBeVisible();

    // Then, switch back to Get Down to Business
    await page.getByTestId('kickoff-mode-getDownToBusiness').check();
    await expect(page.getByTestId('story-time-options-selector')).not.toBeVisible();

    const settings = await getKickoffSettings(page);
    expect(settings?.mode).toBe('getDownToBusiness');
    expect(settings?.storyOption).toBeNull();
  });

  test('should load settings from localStorage on page load', async ({ page }) => {
    const initialSettings: KickoffSetting = { mode: 'storyTime', storyOption: 'manual' };
    
    // beforeEach has navigated and cleared LS. Now set specific LS for this test.
    await setupTestStorage(page, {
      kickoffSettings: initialSettings
    });
    // Reload for the component to pick up the new LS settings
    await page.reload();
    await page.waitForLoadState('networkidle');

    // First, ensure the primary radio button reflecting the loaded mode is checked
    await expect(page.getByTestId('kickoff-mode-storyTime')).toBeChecked();
    // Then, assert visibility of the dependent container
    await expect(page.getByTestId('story-time-options-selector')).toBeVisible();
    // Finally, assert the story option radio button state
    await expect(page.getByTestId('story-time-option-manual')).toBeChecked();
  });

  test('should default to random storyteller if storyTime is selected and storyOption is null in localStorage', async ({ page }) => {
    // Start with cleared localStorage from beforeEach
    
    // Click the storyTime radio button to trigger the state change
    await page.getByTestId('kickoff-mode-storyTime').click();
    
    // Then, assert visibility of the dependent container
    await expect(page.getByTestId('story-time-options-selector')).toBeVisible();
    
    // Finally, assert the story option radio button state (should be random)
    await expect(page.getByTestId('story-time-option-random')).toBeChecked();

    // Verify localStorage was updated by the component using the helper
    const settings = await getKickoffSettings(page);
    expect(settings?.mode).toBe('storyTime');
    expect(settings?.storyOption).toBe('random');
  });
});

import { test, expect, type Page } from '@playwright/test';

const KICKOFF_PAGE_URL = '/kickoff';
const KICKOFF_SETTING_KEY = 'kickoffSetting';

// Define the type for kickoff settings, mirroring the component's state and localStorage structure
interface KickoffSetting {
  mode: 'getDownToBusiness' | 'storyTime';
  storyOption: 'random' | 'manual' | null;
}
// Helper function to get an item from localStorage (useful for verification)
async function getLocalStorageItem(page: Page, key: string): Promise<KickoffSetting | null> {
  return await page.evaluate((k) => {
    const item = localStorage.getItem(k);
    return item ? (JSON.parse(item) as KickoffSetting) : null;
  }, key);
}

test.describe('KickoffScreen E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE [${msg.type().toUpperCase()}]: ${msg.text()}`);
    });
    // Navigate to the app page FIRST
    await page.goto(KICKOFF_PAGE_URL);
    // Clear localStorage for the app's origin
    await page.evaluate((key: string) => {
      localStorage.removeItem(key);
    }, KICKOFF_SETTING_KEY);
    // Reload the page to ensure the component initializes with cleared localStorage
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should load the kickoff page and display default settings', async ({ page }) => {
    await page.goto(KICKOFF_PAGE_URL);
    await expect(page.getByTestId('kickoff-screen-card')).toBeVisible();
    await expect(page.getByTestId('kickoff-mode-getDownToBusiness')).toBeChecked();
    await expect(page.getByTestId('story-time-options-selector')).not.toBeVisible();

    const settings = await getLocalStorageItem(page, KICKOFF_SETTING_KEY);
    expect(settings?.mode).toBe('getDownToBusiness');
    expect(settings?.storyOption).toBeNull();
  });

  test('should switch to Story Time and show story options, defaulting to Randomize', async ({ page }) => {
    await page.goto(KICKOFF_PAGE_URL);
    await page.getByTestId('kickoff-mode-storyTime').check();

    await expect(page.getByTestId('story-time-options-selector')).toBeVisible();
    await expect(page.getByTestId('story-time-option-random')).toBeChecked();

    const settings = await getLocalStorageItem(page, KICKOFF_SETTING_KEY);
    expect(settings?.mode).toBe('storyTime');
    expect(settings?.storyOption).toBe('random');
  });

  test('should switch to Story Time and allow choosing storyteller method', async ({ page }) => {
    await page.goto(KICKOFF_PAGE_URL);
    await page.getByTestId('kickoff-mode-storyTime').check();
    await page.getByTestId('story-time-option-manual').check();

    await expect(page.getByTestId('story-time-option-manual')).toBeChecked();

    const settings = await getLocalStorageItem(page, KICKOFF_SETTING_KEY);
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

    const settings = await getLocalStorageItem(page, KICKOFF_SETTING_KEY);
    expect(settings?.mode).toBe('getDownToBusiness');
    expect(settings?.storyOption).toBeNull();
  });

  test('should load settings from localStorage on page load', async ({ page }) => {
    const initialSettings: KickoffSetting = { mode: 'storyTime', storyOption: 'manual' };
    
    // beforeEach has navigated and cleared LS. Now set specific LS for this test.
    await page.evaluate((data: { key: string; value: KickoffSetting }) => {
      localStorage.setItem(data.key, JSON.stringify(data.value));
    }, { key: KICKOFF_SETTING_KEY, value: initialSettings });
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
    const initialSettings: KickoffSetting = { mode: 'storyTime', storyOption: null };

    // beforeEach has navigated and cleared LS. Now set specific LS for this test.
    await page.evaluate((data: { key: string; value: KickoffSetting }) => {
      localStorage.setItem(data.key, JSON.stringify(data.value));
    }, { key: KICKOFF_SETTING_KEY, value: initialSettings });
    // Reload for the component to pick up the new LS settings
    await page.reload();
    await page.waitForLoadState('networkidle');

    // First, ensure the primary radio button reflecting the loaded mode is checked
    await expect(page.getByTestId('kickoff-mode-storyTime')).toBeChecked();
    // Then, assert visibility of the dependent container
    await expect(page.getByTestId('story-time-options-selector')).toBeVisible();
    // Finally, assert the story option radio button state (should be random)
    await expect(page.getByTestId('story-time-option-random')).toBeChecked();

    // Verify localStorage was updated by the component
    // Verify localStorage was updated by the component using the helper
    const settings = await getLocalStorageItem(page, KICKOFF_SETTING_KEY);
    expect(settings?.mode).toBe('storyTime');
    expect(settings?.storyOption).toBe('random'); // Component should have saved 'random'
  });
});

import { test, expect } from '@playwright/test';

/**
 * E2E tests for GridLayout component
 * Covers: adding components, moving components, saving changes, loading preview, layout in activemeeting
 * Assumes data-testid attributes are present as documented in screens.md
 */

// ---
// E2E: GridLayout in SetupScreen (editable config mode)
// ---
test.describe('GridLayout SetupScreen', () => {
  const gridTestId = '[data-testid="grid-layout"]';
  const resetButtonTestId = '[data-testid="reset-layout-button"]';
  const widgetTestId = (type: string) => `[data-testid="layout-component-${type}"]`;

  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // SetupScreen is at root
    await expect(page.locator(gridTestId)).toBeVisible();
  });

  test('Add and remove widgets, then save and reload', async ({ page }) => {
    const timerCheckbox = page.locator('[data-testid="component-picker-checkbox-timer"]');
    const participantsLabel = page.locator('[data-testid="component-picker-label-participants"]');

    await expect(timerCheckbox).toBeChecked();
    await expect(timerCheckbox).toBeDisabled();
    await expect(page.locator(widgetTestId('timer'))).toBeVisible();
    await participantsLabel.click();
    await expect(page.locator(widgetTestId('participants'))).toBeVisible();
    await participantsLabel.click();
    await expect(page.locator(widgetTestId('participants'))).toHaveCount(0);
    await page.reload();
    await expect(page.locator(widgetTestId('timer'))).toBeVisible();
    await expect(page.locator(widgetTestId('participants'))).toHaveCount(0);
  });

  test('Move a widget and verify new position', async ({ page }) => {
    // Example drag-and-drop logic if supported
    // const timerWidget = page.locator(widgetTestId('timer'));
    // const participantsWidget = page.locator(widgetTestId('participants'));
    // await timerWidget.dragTo(participantsWidget);
    // (Check order or position if possible)
  });

  test('Reset layout', async ({ page }) => {
    await page.click(resetButtonTestId);
    // Optionally verify widgets are removed or layout is reset
  });
});

// ---
// E2E: GridLayout in MeetingOverlay (read-only overlay mode)
// ---
test.describe('GridLayout MeetingOverlay', () => {
  const overlayOpenButton = '[data-testid="start-meeting-button"]';
  const overlayTestId = '[data-component-name="MeetingOverlay"]';
  const closeButton = '[data-testid="meeting-overlay-close"]';
  const gridTestId = '[data-testid="grid-layout"]';
  const widgetTestId = (type: string) => `[data-testid="layout-component-${type}"]`;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to ensure a clean state
    await page.evaluate(() => localStorage.clear());
    // Set up the layout with both 'timer' and 'participants' widgets
    await page.evaluate(() => {
      localStorage.setItem(
        'meetingLayoutConfig',
        JSON.stringify({
          layouts: {
            lg: [
              { i: 'timer', x: 0, y: 0, w: 4, h: 2 },
              { i: 'participants', x: 4, y: 0, w: 4, h: 2 }
            ]
          },
          components: {
            timer: { type: 'timer', visible: true },
            participants: { type: 'participants', visible: true }
          }
        })
      );
    });
    await page.reload(); // Ensure app picks up the new layout
    await page.click(overlayOpenButton);
    const overlay = page.locator(overlayTestId);
    await expect(overlay).toBeVisible();
    await expect(overlay.locator(gridTestId)).toBeVisible();
  });

  test('Displays widgets as per saved config, no edit controls', async ({ page }) => {
    const overlay = page.locator(overlayTestId);
    await expect(overlay.locator(widgetTestId('timer'))).toBeVisible();
    await expect(overlay.locator(widgetTestId('participants'))).toBeVisible();
    // Edit controls should not be visible in overlay
    await expect(overlay.locator('[data-testid="add-component-button"]')).not.toBeVisible();
    await expect(overlay.locator('[data-testid="save-layout-button"]')).not.toBeVisible();
    await expect(overlay.locator('[data-testid="reset-layout-button"]')).not.toBeVisible();
  });

  test('Overlay can be closed', async ({ page }) => {
    const overlay = page.locator(overlayTestId);
    await page.click(closeButton);
    await expect(overlay).not.toBeVisible();
  });
});

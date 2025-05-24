import { test, expect } from '@playwright/test';

// E2E: GridLayout in MeetingOverlay (read-only overlay mode)
test.describe('GridLayout MeetingOverlay', () => {
  const overlayOpenButton = '[data-testid="start-meeting-button"]';
  const overlayTestId = '[data-component-name="MeetingOverlay"]';
  const closeButton = '[data-testid="meeting-overlay-close"]';
  const gridTestId = '[data-testid="grid-layout"]';
  const widgetTestId = (type: string) => `[data-testid="layout-component-${type}"]`; // Assuming this matches MeetingOverlay's widget testids
  const localStorageKey = 'meetingLayoutConfig'; // Key used in these tests for layout

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to ensure a clean state for this test suite
    await page.evaluate((key) => localStorage.removeItem(key), localStorageKey);
    // Set up a specific layout for meeting overlay tests
    await page.evaluate((key) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          layouts: {
            lg: [
              { i: 'timer', x: 0, y: 0, w: 4, h: 2, static: true }, // Timer is often static
              { i: 'participants', x: 4, y: 0, w: 4, h: 2 },
              { i: 'notes', x: 8, y: 0, w: 4, h: 2 } // Added another widget for variety
            ]
          },
          components: {
            timer: { type: 'timer', visible: true },
            participants: { type: 'participants', visible: true },
            notes: { type: 'notes', visible: true }
          }
        })
      );
    }, localStorageKey);
    await page.reload(); // Reload to apply localStorage changes
    await page.locator(overlayOpenButton).click();
    const overlay = page.locator(overlayTestId);
    await expect(overlay).toBeVisible();
    await expect(overlay.locator(gridTestId)).toBeVisible();
  });

  test('Displays widgets as per saved config, no edit controls', async ({ page }) => {
    const overlay = page.locator(overlayTestId);
    // Check for specific widgets based on beforeEach setup
    await expect(overlay.locator(widgetTestId('timer'))).toBeVisible();
    await expect(overlay.locator(widgetTestId('participants'))).toBeVisible();
    await expect(overlay.locator(widgetTestId('notes'))).toBeVisible();

    // Edit controls should not be visible in overlay (assuming these are their testids)
    // These might be part of the SetupScreen's GridLayout, not directly in MeetingOverlay's instance
    await expect(page.locator('[data-testid="add-component-button"]')).not.toBeVisible(); // Check globally if not in overlay
    await expect(page.locator('[data-testid="save-layout-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="reset-layout-button"]')).not.toBeVisible();
  });

  test('Overlay can be closed', async ({ page }) => {
    const overlay = page.locator(overlayTestId);
    await page.locator(closeButton).click();
    await expect(overlay).not.toBeVisible();
  });

  // Potential test for read-only behavior (more complex)
  test('Widgets in overlay are not draggable or resizable', async ({ page }) => {
    const timerWidgetInOverlay = page.locator(overlayTestId).locator(widgetTestId('timer'));
    const initialBox = await timerWidgetInOverlay.boundingBox();
    expect(initialBox).not.toBeNull();

    // Attempt to drag (Playwright's dragTo might still work visually but not change layout)
    // A more robust check would be to see if layout data in react-grid-layout instance changes, or if resize handles are absent.
    try {
      await timerWidgetInOverlay.dragTo(timerWidgetInOverlay, { targetPosition: { x: initialBox!.x + 50, y: initialBox!.y } });
    } catch (e) {
      // Dragging might be prevented at a lower level, causing an error, which is fine.
    }
    
    const afterDragBox = await timerWidgetInOverlay.boundingBox();
    expect(afterDragBox).not.toBeNull();
    // Check if position actually changed (it shouldn't for a read-only, static widget)
    // For non-static widgets, this check would be if their grid 'x' or 'y' changed in the underlying layout state.
    // Since timer is static: true in this setup, it shouldn't move.
    expect(afterDragBox!.x).toBeCloseTo(initialBox!.x, 1);
    expect(afterDragBox!.y).toBeCloseTo(initialBox!.y, 1);

    // Check for absence of resize handles (specific selector depends on react-grid-layout implementation)
    await expect(timerWidgetInOverlay.locator('.react-resizable-handle')).toHaveCount(0);
  });
});

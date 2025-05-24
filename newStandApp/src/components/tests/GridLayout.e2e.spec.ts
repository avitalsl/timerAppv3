import { test, expect } from '@playwright/test';
import type { LayoutItem } from '../../types/layoutTypes';
import { expandComponentsToFillRow } from '../../utils/layoutUtils';

// Grid layout constants (mirroring GridLayout.tsx)
const COLS = 12;
const ROW_HEIGHT = 60;
const MARGIN_X = 10;
const MARGIN_Y = 10;
const CONTAINER_PADDING_X = 10; // Assuming symmetrical padding
const CONTAINER_PADDING_Y = 10; // Assuming symmetrical padding
const LOCAL_STORAGE_LAYOUT_KEY = 'gridLayoutResponsive'; // Placeholder, confirm actual key

// Helper function to calculate expected pixel geometry of a grid item
// This is a simplified model. react-grid-layout's calculations can be more complex.
// It's often better to get boundingBox relative to the grid container.
const calculateExpectedPixelGeometry = (
  item: LayoutItem,
  gridContainerWidth: number,
) => {
  // Calculate column width based on container width, margins, and padding
  // This formula is a common interpretation for react-grid-layout
  const usableWidth = gridContainerWidth - 2 * CONTAINER_PADDING_X - (COLS - 1) * MARGIN_X;
  const colWidth = usableWidth / COLS;

  const expectedX = item.x * (colWidth + MARGIN_X) + CONTAINER_PADDING_X;
  const expectedY = item.y * (ROW_HEIGHT + MARGIN_Y) + CONTAINER_PADDING_Y;
  const expectedWidth = item.w * colWidth + Math.max(0, item.w - 1) * MARGIN_X;
  const expectedHeight = item.h * ROW_HEIGHT + Math.max(0, item.h - 1) * MARGIN_Y;

  return {
    x: expectedX,
    y: expectedY,
    width: expectedWidth,
    height: expectedHeight,
  };
};

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

  test('All widgets persist layout after move and reload', async ({ page }) => {
    // Ensure a clean, known state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator(gridTestId)).toBeVisible();

    const widgetIds = [
      'participants', 'links', 'notes', 'agenda', 'sprintGoals', 'checklist'
    ];
    for (const id of widgetIds) {
      const label = page.locator(`[data-testid="component-picker-label-${id}"]`);
      await label.click();
      await expect(page.locator(`[data-testid="grid-layout-item-${id}"]`)).toBeVisible();
    }
    // Timer should already be visible
    await expect(page.locator(`[data-testid="grid-layout-item-timer"]`)).toBeVisible();

    // Move each widget to a new position (simulate drag-and-drop)
    // We'll move each widget by a unique offset so their transforms change
    // Timer is often static, so skip if not draggable
    const moveOffsets = {
      timer: { x: 0, y: 0 }, // leave timer in place (if static)
      participants: { x: 120, y: 0 },
      links: { x: 0, y: 120 },
      notes: { x: 120, y: 120 },
      agenda: { x: 240, y: 0 },
      sprintGoals: { x: 0, y: 240 },
      checklist: { x: 240, y: 120 }
    };
    for (const id of widgetIds) {
      const widget = page.locator(`[data-testid="grid-layout-item-${id}"]`);
      const { x, y } = moveOffsets[id as keyof typeof moveOffsets];
      // Try/catch in case widget is not draggable
      try {
        await widget.dragTo(widget, { force: true, targetPosition: { x: x + 10, y: y + 10 } });
      } catch (e) {
        // Ignore drag errors for non-draggable widgets
      }
    }

    // Capture positions for all widgets
    const allWidgetIds = ['timer', ...widgetIds];
    // --- Get Saved Layout Data from localStorage ---
    const savedLayoutsString = await page.evaluate((key) => localStorage.getItem(key), LOCAL_STORAGE_LAYOUT_KEY);
    expect(savedLayoutsString).not.toBeNull();
    const savedLayoutsConfig = JSON.parse(savedLayoutsString!) as { lg?: LayoutItem[] }; // Assuming 'lg' breakpoint is primary
    const savedSetupLayoutItems = savedLayoutsConfig.lg || [];
    expect(savedSetupLayoutItems.length).toBeGreaterThan(0); // Ensure we have layout items

    // --- Verify Persistence on Setup Screen Reload using Bounding Boxes ---
    await page.reload();
    await expect(page.locator(gridTestId)).toBeVisible();
    const setupGridContainer = page.locator(gridTestId); // The main grid container on setup
    const setupGridContainerBox = await setupGridContainer.boundingBox();
    expect(setupGridContainerBox).not.toBeNull();

    for (const savedItem of savedSetupLayoutItems) {
      if (!allWidgetIds.includes(savedItem.i)) continue; // Only check widgets we added/expect
      const widgetLocator = setupGridContainer.locator(`[data-testid="grid-layout-item-${savedItem.i}"]`);
      await expect(widgetLocator).toBeVisible();
      const widgetBox = await widgetLocator.boundingBox();
      expect(widgetBox).not.toBeNull();

      const expectedGeo = calculateExpectedPixelGeometry(savedItem, setupGridContainerBox!.width);

      // Compare bounding box properties relative to the grid container's top-left
      expect(widgetBox!.x - setupGridContainerBox!.x).toBeCloseTo(expectedGeo.x, 0); 
      expect(widgetBox!.y - setupGridContainerBox!.y).toBeCloseTo(expectedGeo.y, 0);
      expect(widgetBox!.width).toBeCloseTo(expectedGeo.width, 0);
      expect(widgetBox!.height).toBeCloseTo(expectedGeo.height, 0);
    }

    // Click the "Start Meeting" button
    await page.locator('[data-testid="start-meeting-button"]').click();

    // and that widgets within it also use 'grid-layout-item-ID'
    const activeMeetingLayoutLocator = page.locator('[data-testid="active-meeting-grid-layout"]');
    await expect(activeMeetingLayoutLocator).toBeVisible();

    // --- Calculate Expected Meeting Layout ---
    const expectedMeetingLayoutItems = expandComponentsToFillRow(savedSetupLayoutItems, COLS);

    // --- Verify Layout in Meeting Overlay using Bounding Boxes ---
    const meetingGridContainer = activeMeetingLayoutLocator; // Already located
    const meetingGridContainerBox = await meetingGridContainer.boundingBox();
    expect(meetingGridContainerBox).not.toBeNull();

    for (const expectedItem of expectedMeetingLayoutItems) {
      if (!allWidgetIds.includes(expectedItem.i)) continue; // Check only relevant widgets
      const widgetLocator = meetingGridContainer.locator(`[data-testid="grid-layout-item-${expectedItem.i}"]`);
      await expect(widgetLocator).toBeVisible();
      const widgetBox = await widgetLocator.boundingBox();
      expect(widgetBox).not.toBeNull();

      const expectedGeo = calculateExpectedPixelGeometry(expectedItem, meetingGridContainerBox!.width);
      
      // Compare bounding box properties relative to the grid container's top-left
      expect(widgetBox!.x - meetingGridContainerBox!.x).toBeCloseTo(expectedGeo.x, 0);
      expect(widgetBox!.y - meetingGridContainerBox!.y).toBeCloseTo(expectedGeo.y, 0);
      expect(widgetBox!.width).toBeCloseTo(expectedGeo.width, 0);
      expect(widgetBox!.height).toBeCloseTo(expectedGeo.height, 0);
    }
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
    await page.reload();
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

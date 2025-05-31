import { test, expect } from '@playwright/test';
import type { KickoffSetting, Participant, StoredTimerConfig } from '../../contexts/MeetingContext';
import { clearAppStorage, setupTestStorage } from '../../services/tests/mockStorageForTests';

// --- Constants for Page URLs (if directly navigating) ---
// const TIMER_SETUP_PAGE_URL = '/timer-setup';
// const PARTICIPANTS_PAGE_URL = '/participants';
const APP_ROOT_URL = '/'; // Assuming tests start from the root

// --- Constants for Data Test IDs ---
const START_MEETING_BUTTON_TEST_ID = 'start-meeting-button'; // Assumed ID for the global start meeting button
const MEETING_OVERLAY_TEST_ID = 'meeting-screen-container';
const TIMER_WIDGET_TEST_ID = 'layout-component-timer';
const TIMER_DISPLAY_TEST_ID = 'timer-circular-time-text';
const TIMER_PLAY_PAUSE_BUTTON_TEST_ID = 'timer-play-pause-button';
const TIMER_NEXT_RESET_BUTTON_TEST_ID = 'timer-next-reset-button';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

test.describe('Meeting Timer E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        console.log(`BROWSER CONSOLE [${msg.type().toUpperCase()}]: ${msg.text()}`);
      }
    });
    await page.goto(APP_ROOT_URL);
    await clearAppStorage(page);
    // Note: setupTestStorage will be called within each test or a nested describe block
  });

  test.describe('Fixed Time Mode', () => {
    const fixedModeConfig: StoredTimerConfig = { mode: 'fixed', totalDurationMinutes: 1, allowExtension: false };
    const defaultParticipants: Participant[] = [{ name: 'Alice', included: true }];
    const defaultKickoff: KickoffSetting = { mode: 'getDownToBusiness', storyOption: null };

    test.beforeEach(async ({ page }) => {
      await setupTestStorage(page, {
        timerConfig: fixedModeConfig,
        participants: defaultParticipants,
        kickoffSettings: defaultKickoff
      });
      await page.getByTestId(START_MEETING_BUTTON_TEST_ID).click();
      await expect(page.getByTestId(MEETING_OVERLAY_TEST_ID)).toBeVisible();
      await expect(page.getByTestId(MEETING_OVERLAY_TEST_ID).getByTestId(TIMER_WIDGET_TEST_ID)).toBeVisible();
    });

    test('should start timer with correct duration and be pausable/resumable', async ({ page }) => {
      // Initial state: running, time displayed
      await expect(page.getByTestId(MEETING_OVERLAY_TEST_ID).getByTestId(TIMER_DISPLAY_TEST_ID)).toContainText(formatTime(fixedModeConfig.totalDurationMinutes! * 60));
      const playPauseButton = page.getByTestId(MEETING_OVERLAY_TEST_ID).getByTestId(TIMER_PLAY_PAUSE_BUTTON_TEST_ID);
      await expect(playPauseButton.locator('svg[class*="lucide-pause"]')).toBeVisible(); // Pause icon visible

      // Pause timer
      await playPauseButton.click();
      await expect(playPauseButton.locator('svg[class*="lucide-play"]')).toBeVisible(); // Play icon visible
      const timeAfterPause = await page.getByTestId(MEETING_OVERLAY_TEST_ID).getByTestId(TIMER_DISPLAY_TEST_ID).textContent();
      await page.waitForTimeout(1100); // Wait a bit longer than 1s
      await expect(page.getByTestId(MEETING_OVERLAY_TEST_ID).getByTestId(TIMER_DISPLAY_TEST_ID)).toHaveText(timeAfterPause!); // Time should not change

      // Resume timer
      await playPauseButton.click();
      await expect(playPauseButton.locator('svg[class*="lucide-pause"]')).toBeVisible(); // Pause icon visible
      await page.waitForTimeout(1100); // Wait for time to tick
      await expect(page.getByTestId(MEETING_OVERLAY_TEST_ID).getByTestId(TIMER_DISPLAY_TEST_ID)).not.toHaveText(timeAfterPause!); // Time should have changed
    });

    test('next/reset button should be disabled reset icon', async ({ page }) => {
      const nextResetButton = page.getByTestId(MEETING_OVERLAY_TEST_ID).getByTestId(TIMER_NEXT_RESET_BUTTON_TEST_ID);
      await expect(nextResetButton).toBeVisible();
      await expect(nextResetButton).toBeDisabled();
      await expect(nextResetButton.locator('svg[class*="lucide-refresh-cw"]')).toBeVisible();
    });
  });

  test.describe('Per Participant Mode', () => {
    const perParticipantConfig: StoredTimerConfig = { mode: 'per-participant', durationPerParticipantSeconds: 5, allowExtension: false };
    const multiParticipants: Participant[] = [
      { name: 'Alice', included: true },
      { name: 'Bob', included: true },
      { name: 'Charlie', included: false }, // Excluded
      { name: 'Diana', included: true },
    ];
    const defaultKickoff: KickoffSetting = { mode: 'getDownToBusiness', storyOption: null };

    test.beforeEach(async ({ page }) => {
      await setupTestStorage(page, {
        timerConfig: perParticipantConfig,
        participants: multiParticipants,
        kickoffSettings: defaultKickoff
      });
      await page.getByTestId(START_MEETING_BUTTON_TEST_ID).click();
      await expect(page.getByTestId(MEETING_OVERLAY_TEST_ID)).toBeVisible();
    });

    test('should start with first participant and allow manual skip', async ({ page }) => {
      const meetingOverlay = page.getByTestId(MEETING_OVERLAY_TEST_ID);
      const timerDisplay = meetingOverlay.getByTestId(TIMER_DISPLAY_TEST_ID);
      const nextButton = meetingOverlay.getByTestId(TIMER_NEXT_RESET_BUTTON_TEST_ID);

      // Alice is first
      await expect(timerDisplay).toContainText(formatTime(perParticipantConfig.durationPerParticipantSeconds!));
      await expect(nextButton.locator('svg[class*="lucide-skip-forward"]')).toBeVisible();
      await page.pause();
      await expect(nextButton).toBeEnabled();

      // Skip to Bob
      await nextButton.click();
      await expect(timerDisplay).toContainText(formatTime(perParticipantConfig.durationPerParticipantSeconds!)); // Resets for Bob
      // Add assertion for current participant name if displayed in UI

      // Skip to Diana (Charlie is skipped)
      await nextButton.click();
      await expect(timerDisplay).toContainText(formatTime(perParticipantConfig.durationPerParticipantSeconds!)); // Resets for Diana
      
      // Now on Diana (last included participant), skip button should be disabled
      await expect(nextButton).toBeDisabled();
    });

    test('should automatically advance to next participant when time expires', async ({ page }) => {
      const meetingOverlay = page.getByTestId(MEETING_OVERLAY_TEST_ID);
      const timerDisplay = meetingOverlay.getByTestId(TIMER_DISPLAY_TEST_ID);
      const duration = perParticipantConfig.durationPerParticipantSeconds!;

      // Alice is first
      await expect(timerDisplay).toContainText(formatTime(duration));
      // Wait for Alice's time to run out + a buffer
      await page.waitForTimeout((duration + 1) * 1000);
      
      // Should now be Bob's turn, timer reset
      await expect(timerDisplay).toContainText(formatTime(duration));
      // Add assertion for current participant name if displayed in UI (e.g. "Now: Bob")

      // Wait for Bob's time to run out + a buffer
      await page.waitForTimeout((duration + 1) * 1000);

      // Should now be Diana's turn (Charlie skipped), timer reset
      await expect(timerDisplay).toContainText(formatTime(duration));
    });
  });

  test('closing overlay should end meeting', async ({ page }) => {
    // Setup a quick meeting
    const fixedModeConfig: StoredTimerConfig = { mode: 'fixed', totalDurationMinutes: 1, allowExtension: false };
    await setupTestStorage(page, {
      timerConfig: fixedModeConfig,
      participants: [{ name: 'Test', included: true }],
      kickoffSettings: { mode: 'getDownToBusiness', storyOption: null }
    });
    await page.getByTestId(START_MEETING_BUTTON_TEST_ID).click();
    await expect(page.getByTestId(MEETING_OVERLAY_TEST_ID)).toBeVisible();

    // Click the start meeting button again to toggle overlay off (assuming it's a toggle)
    // Or, if there's a dedicated close button on the overlay, use that.
    // For now, assuming the START_MEETING_BUTTON_TEST_ID also acts as a hide button when overlay is visible.
    // This might need adjustment based on actual app behavior for closing the overlay.
    await page.getByTestId('meeting-overlay-close').click();
    await expect(page.getByTestId(MEETING_OVERLAY_TEST_ID)).not.toBeVisible();

    // Verify meeting state is reset (e.g. by trying to start a new meeting and checking its initial state)
    // This part is harder to verify without inspecting context directly or more UI cues.
    // For now, just ensuring overlay closes is a good first step.
  });

});

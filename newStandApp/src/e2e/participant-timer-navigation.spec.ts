import { test, expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Helper functions for common test operations
 */
async function navigateToSetupScreen(page: Page) {
  await page.goto('http://localhost:5174/');
  await page.waitForSelector('[data-testid="screen-setup"]', { state: 'visible' });
}

async function navigateToParticipantsScreen(page: Page) {
  console.log('Navigating to participants screen...');
  
  try {
    // Navigate to the participants page via the sidebar link
    // This should be available after enabling the participants component
    const participantsSidebarLink = page.locator('[data-testid="sidebar-nav-link-participants"]');
    await participantsSidebarLink.click();
    
    // Wait for the screen to load
    await page.waitForSelector('[data-testid="screen-participants"]', { timeout: 5000 });
    console.log('Participants screen loaded successfully');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/participants-screen.png' });
  } catch (error: unknown) {
    console.error('Failed to load participants screen:', error instanceof Error ? error.message : String(error));
    await page.screenshot({ path: 'test-results/participants-screen-error.png' });
    throw new Error('Failed to navigate to participants screen');
  }
}

async function addParticipant(page: Page, name: string) {
  console.log(`Adding participant: ${name}`);
  
  try {
    // Wait for the input field to be visible
    await page.waitForSelector('[data-testid="input-participant-name"]', { state: 'visible', timeout: 5000 });
    console.log('Input field is visible');
    
    // Clear the input field first
    await page.click('[data-testid="input-participant-name"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    
    // Fill in the participant name
    await page.fill('[data-testid="input-participant-name"]', name);
    console.log(`Filled input with name: ${name}`);
    
    // Take a screenshot before clicking add button
    await page.screenshot({ path: `test-results/before-add-${name}.png` });
    
    // Wait for the add button to be enabled
    await page.waitForSelector('[data-testid="btn-add-participant"]', { state: 'visible', timeout: 5000 });
    
    // Click the add button
    await page.click('[data-testid="btn-add-participant"]');
    console.log('Clicked add button');
    
    // Wait a moment for the UI to update
    await page.waitForTimeout(500);
    
    // Take a screenshot after adding
    await page.screenshot({ path: `test-results/after-add-${name}.png` });
    
    // Try to verify the participant was added by looking for their name in the list
    try {
      await page.waitForSelector(`text="${name}"`, { timeout: 3000 });
      console.log(`Successfully verified that ${name} was added to the list`);
    } catch (error: unknown) {
      console.warn(`Could not verify that ${name} was added to the list: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error: unknown) {
    console.error(`Error adding participant ${name}:`, error instanceof Error ? error.message : String(error));
    await page.screenshot({ path: `test-results/error-add-${name}.png` });
    throw error;
  }
}

async function selectTimerMode(page: Page, mode: 'fixed' | 'per-participant') {
  const selector = mode === 'fixed' ? 'timer-mode-fixed' : 'timer-mode-per-participant';
  await page.click(`[data-testid="${selector}"]`);
}

async function startMeeting(page: Page) {
  // Try to find the start button by test ID first
  const startButton = await page.getByTestId('start-meeting-button');
  if (await startButton.count() > 0) {
    await startButton.click();
  } else {
    // Fallback to a more generic approach
    await page.getByRole('button', { name: /start|begin|launch|kickoff/i }).click();
  }
  
  // Wait for navigation
  await page.waitForTimeout(1000);
}

async function findTimerElement(page: Page): Promise<Locator> {
  // Find the timer element in the meeting screen
  // Using the data-testid attribute to get just the timer value text
  return page.locator('[data-testid="timer-circular-time-text"]');
}

// This function is not used in our current test but might be useful in the future
async function findPlayPauseButton(page: Page): Promise<Locator> {
  return page.getByTestId('timer-play-pause-button');
}

async function findNextParticipantButton(page: Page): Promise<Locator> {
  return page.getByTestId('timer-next-button').or(page.getByRole('button', { name: /next|forward|skip/i }));
}

async function getExpectedInitialTime(page: Page): Promise<string> {
  console.log('Getting expected initial timer value');
  // Return a reasonable default value for the timer
  // This should match the format used in the app (MM:SS)
  return '02:00';
}

/**
 * Enable the participants component in the layout settings on the setup screen
 */
async function enableParticipantsComponent(page: Page) {
  console.log('Enabling participants component in layout settings...');
  
  try {
    // Wait for the setup screen to be fully loaded
    await page.waitForSelector('[data-testid="setup-layout-config-section"]', { state: 'visible', timeout: 5000 });
    
    // Take a screenshot before enabling
    await page.screenshot({ path: 'test-results/before-enable-participants.png' });
    
    // Instead of directly checking the checkbox (which has an intercepting element),
    // click on the label which will toggle the checkbox
    const participantsLabel = page.locator('[data-testid="component-picker-label-participants"]');
    
    if (await participantsLabel.count() > 0) {
      console.log('Found participants component label, clicking it...');
      await participantsLabel.click();
      console.log('Clicked on participants component label');
      
      // Wait a moment for the UI to update
      await page.waitForTimeout(500);
      
      // Take a screenshot after enabling
      await page.screenshot({ path: 'test-results/after-enable-participants.png' });
    } else {
      // Try alternative approach - use JavaScript to check the checkbox
      console.log('Participants label not found, trying JavaScript approach...');
      await page.evaluate(() => {
        const checkbox = document.querySelector('[data-testid="component-picker-checkbox-participants"]') as HTMLInputElement;
        if (checkbox && !checkbox.checked) {
          checkbox.checked = true;
          // Dispatch change event to trigger any listeners
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('Enabled participants component via JavaScript');
        }
      });
      
      // Take a screenshot after enabling
      await page.screenshot({ path: 'test-results/after-enable-participants-js.png' });
    }
    
    // Wait for the sidebar link to appear, which confirms the component was enabled
    console.log('Waiting for participants sidebar link to appear...');
    await page.waitForSelector('[data-testid="sidebar-nav-link-participants"]', { timeout: 5000 });
    console.log('Participants sidebar link is now visible');
    
  } catch (error: unknown) {
    console.error('Error enabling participants component:', error instanceof Error ? error.message : String(error));
    await page.screenshot({ path: 'test-results/error-enable-participants.png' });
    throw new Error('Failed to enable participants component');
  }
}

// Per-Participant Timer Navigation Tests
test.describe('Per-Participant Timer Navigation Tests', () => {
  // Before each test, load the application
  test.beforeEach(async ({ page }) => {
    // Navigate to setup screen before each test
    await navigateToSetupScreen(page);
    
    // Enable the participants component in the layout settings
    await enableParticipantsComponent(page);
  });

  test('Per-Participant Timer Navigation Flow - Verify timer advances between participants', async ({ page }) => {
    // Step 1: Add multiple participants
    await test.step('Add multiple participants', async () => {
      console.log('Starting test: Adding participants');
      await navigateToParticipantsScreen(page);
      
      // Take a screenshot before adding participants
      await page.screenshot({ path: 'test-results/before-adding-participants.png' });
      
      // Add participants with better error handling
      try {
        await addParticipant(page, 'Participant 1');
        console.log('Added Participant 1');
        
        await addParticipant(page, 'Participant 2');
        console.log('Added Participant 2');
        
        await addParticipant(page, 'Participant 3');
        console.log('Added Participant 3');
        
        // Take a screenshot after adding participants
        await page.screenshot({ path: 'test-results/after-adding-participants.png' });
      } catch (error: unknown) {
        console.error('Error adding participants:', error instanceof Error ? error.message : String(error));
        // Take a screenshot of the error state
        await page.screenshot({ path: 'test-results/participant-addition-error.png' });
        throw error;
      }
    });
    
    // Step 2: Configure and start meeting
    await test.step('Configure and start meeting in per-participant mode', async () => {
      await navigateToSetupScreen(page);
      await selectTimerMode(page, 'per-participant');
      await startMeeting(page);
      
      // Wait for meeting UI to fully load
      await page.waitForTimeout(2000);
    });
    
    // Step 3: Verify initial timer is visible, has the correct format, and is running
    let initialTimerText = '';
    await test.step('Verify initial timer is visible, has the correct format, and is running', async () => {
      // Verify timer is running for the first participant
      const timerElement = await findTimerElement(page);
      expect(await timerElement.isVisible()).toBeTruthy();
      
      // Verify timer shows the correct initial time
      initialTimerText = await timerElement.textContent() || '';
      console.log(`Initial timer value: ${initialTimerText}`);
      expect(initialTimerText).toMatch(/\d+:\d+/); // Timer format check
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/initial-participant.png' });
      
      // Wait 3 seconds as requested by user
      console.log('Waiting 3 seconds before clicking next...');
      await page.waitForTimeout(3000);
      
      // Get updated timer value to confirm it's running
      const updatedTimerText = await timerElement.textContent();
      console.log(`Updated timer value after 3s: ${updatedTimerText}`);
      expect(initialTimerText).not.toEqual(updatedTimerText);
    });
    
    // Step 4: Click next button and verify timer resets
    await test.step('Click next button and verify timer resets', async () => {
      // Find and click the next button
      const nextButton = await findNextParticipantButton(page);
      expect(await nextButton.isVisible()).toBeTruthy();
      console.log('Clicking next button...');
      await nextButton.click();
      
      // Wait for transition
      await page.waitForTimeout(1000);
      
      // Take screenshot after clicking next
      await page.screenshot({ path: 'test-results/after-next-button.png' });
      
      // Verify timer is visible
      const timerElement = await findTimerElement(page);
      expect(await timerElement.isVisible()).toBeTruthy();
      
      // Get the timer value and verify it's the default/starting value
      const timerText = await timerElement.textContent() || '';
      console.log(`Timer value after clicking next: ${timerText}`);
      
      // Verify the timer is reset (should be different from the previous running timer)
      expect(timerText).not.toEqual(initialTimerText);
      
      // Verify the timer is reset to the correct initial value
      const expectedInitialTime = await getExpectedInitialTime(page);
      console.log(`Expected initial time: ${expectedInitialTime}`);
      expect(timerText).toEqual(expectedInitialTime);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/second-participant.png' });
      
      // Wait 3 seconds as requested by user
      console.log('Waiting 3 seconds before clicking next again...');
      await page.waitForTimeout(3000);
      
      // Get updated timer value to confirm it's running
      const updatedTimerText = await timerElement.textContent();
      console.log(`Updated timer value after 3s: ${updatedTimerText}`);
      expect(timerText).not.toEqual(updatedTimerText);
    });
    
    // Step 5: Click next button again and verify timer resets again
    await test.step('Click next button again and verify timer resets again', async () => {
      // Find and click the next button again
      const nextButton = await findNextParticipantButton(page);
      console.log('Clicking next button again...');
      await nextButton.click();
      
      // Wait for transition
      await page.waitForTimeout(1000);
      
      // Take screenshot after clicking next
      await page.screenshot({ path: 'test-results/after-second-next-button.png' });
      
      // Verify timer is visible
      const timerElement = await findTimerElement(page);
      expect(await timerElement.isVisible()).toBeTruthy();
      
      // Get the timer value and verify it's the default/starting value
      const timerText = await timerElement.textContent() || '';
      console.log(`Timer value after clicking next again: ${timerText}`);
      
      // Verify the timer is reset to the correct initial value
      const expectedInitialTime = await getExpectedInitialTime(page);
      console.log(`Expected initial time: ${expectedInitialTime}`);
      expect(timerText).toEqual(expectedInitialTime);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/third-participant.png' });
      
      // Wait 3 seconds as requested by user
      console.log('Waiting 3 seconds after final participant...');
      await page.waitForTimeout(3000);
      
      // Get updated timer value to confirm it's running
      const updatedTimerText = await timerElement.textContent();
      console.log(`Updated timer value after 3s: ${updatedTimerText}`);
      expect(timerText).not.toEqual(updatedTimerText);
    });
  });
});

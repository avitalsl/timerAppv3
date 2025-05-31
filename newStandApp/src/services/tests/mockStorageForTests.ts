/**
 * Test utilities for Playwright E2E tests
 * This file provides functions to set up localStorage for tests
 */

import type { Page } from '@playwright/test';
import type { KickoffSetting, Participant, StoredTimerConfig } from '../../contexts/MeetingContext';
import type { ComponentVisibilityConfig } from '../../types/componentVisibilityTypes';
import type { LayoutConfiguration } from '../../types/layoutTypes';

// Storage key constants with prefixes
const STORAGE_PREFIX = 'timerApp/';
const KICKOFF_SETTINGS_KEY = `${STORAGE_PREFIX}kickoffSetting`;
const PARTICIPANTS_KEY = `${STORAGE_PREFIX}participantsList`;
const PARTICIPANT_VISIBILITY_KEY = `${STORAGE_PREFIX}participantListVisibilityMode`;
const TIMER_CONFIG_KEY = `${STORAGE_PREFIX}timerSetupConfig`;
const COMPONENT_VISIBILITY_KEY = `${STORAGE_PREFIX}meetingComponentsConfig`;
const LAYOUT_CONFIG_KEY = `${STORAGE_PREFIX}meetingLayoutConfig`;

/**
 * Clear all app-related localStorage items
 */
export async function clearAppStorage(page: Page): Promise<void> {
  try {
    await page.evaluate((prefix) => {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Could not access localStorage during clearAppStorage:', e);
      }
    }, STORAGE_PREFIX);
  } catch (e) {
    console.warn('Error in clearAppStorage:', e);
  }
}

/**
 * Set up localStorage with initial test data
 */
export async function setupTestStorage(page: Page, {
  kickoffSettings,
  participants,
  participantVisibility,
  timerConfig,
  componentVisibility,
  layoutConfig
}: {
  kickoffSettings?: KickoffSetting;
  participants?: Participant[];
  participantVisibility?: 'all_visible' | 'focus_speaker';
  timerConfig?: StoredTimerConfig;
  componentVisibility?: ComponentVisibilityConfig;
  layoutConfig?: LayoutConfiguration;
}): Promise<void> {
  try {
    await page.evaluate(({ keys, data }) => {
      try {
        // Only set items that are provided
        if (data.kickoffSettings) {
          localStorage.setItem(keys.kickoffSettings, JSON.stringify(data.kickoffSettings));
        }
        if (data.participants) {
          localStorage.setItem(keys.participants, JSON.stringify(data.participants));
        }
        if (data.participantVisibility) {
          localStorage.setItem(keys.participantVisibility, JSON.stringify(data.participantVisibility));
        }
        if (data.timerConfig) {
          localStorage.setItem(keys.timerConfig, JSON.stringify(data.timerConfig));
        }
        if (data.componentVisibility) {
          localStorage.setItem(keys.componentVisibility, JSON.stringify(data.componentVisibility));
        }
        if (data.layoutConfig) {
          localStorage.setItem(keys.layoutConfig, JSON.stringify(data.layoutConfig));
        }
      } catch (e) {
        console.warn('Could not access localStorage during setupTestStorage:', e);
      }
    }, {
      keys: {
        kickoffSettings: KICKOFF_SETTINGS_KEY,
        participants: PARTICIPANTS_KEY,
        participantVisibility: PARTICIPANT_VISIBILITY_KEY,
        timerConfig: TIMER_CONFIG_KEY,
        componentVisibility: COMPONENT_VISIBILITY_KEY,
        layoutConfig: LAYOUT_CONFIG_KEY
      },
      data: {
        kickoffSettings,
        participants,
        participantVisibility,
        timerConfig,
        componentVisibility,
        layoutConfig
      }
    });
  } catch (e) {
    console.warn('Error in setupTestStorage:', e);
  }
}

/**
 * Helper functions to get specific storage items
 */
export async function getKickoffSettings(page: Page): Promise<KickoffSetting | null> {
  return page.evaluate((key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }, KICKOFF_SETTINGS_KEY);
}

export async function getParticipants(page: Page): Promise<Participant[] | null> {
  return page.evaluate((key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }, PARTICIPANTS_KEY);
}

export async function getTimerConfig(page: Page): Promise<StoredTimerConfig | null> {
  return page.evaluate((key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }, TIMER_CONFIG_KEY);
}

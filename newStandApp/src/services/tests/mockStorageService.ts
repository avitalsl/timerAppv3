/**
 * Mock implementation of storage services for testing
 * This allows tests to interact with the storage services without directly accessing localStorage
 */

import type { KickoffSetting, Participant, StoredTimerConfig } from '../../contexts/MeetingContext';
import type { ComponentVisibilityConfig } from '../../types/componentVisibilityTypes';
import type { LayoutConfiguration } from '../../types/layoutTypes';
import { DEFAULT_LAYOUT_CONFIG } from '../../types/layoutTypes';

// Mock storage that replaces localStorage for testing
let mockStorage: Record<string, string> = {};

// Reset the mock storage (useful for beforeEach in tests)
export function resetMockStorage(): void {
  mockStorage = {};
}

// Helper to get/set directly from mockStorage (for test verification)
export function getMockItem<T>(key: string): T | null {
  const item = mockStorage[`timerApp/${key}`];
  return item ? JSON.parse(item) : null;
}

export function setMockItem<T>(key: string, value: T): void {
  mockStorage[`timerApp/${key}`] = JSON.stringify(value);
}

// Mock implementations of our storage services
export const mockKickoffSettingsStorageService = {
  getKickoffSettings(): KickoffSetting {
    const settings = getMockItem<KickoffSetting>('kickoffSetting');
    return settings || { 
      mode: 'getDownToBusiness', 
      storyOption: null,
      storyDurationSeconds: undefined,
      storytellerName: ''
    };
  },
  
  saveKickoffSettings(settings: KickoffSetting): boolean {
    try {
      setMockItem('kickoffSetting', settings);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export const mockParticipantsStorageService = {
  getParticipants(): Participant[] {
    const participants = getMockItem<Participant[]>('participantsList');
    return participants || [];
  },
  
  saveParticipants(participants: Participant[]): boolean {
    try {
      setMockItem('participantsList', participants);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export const mockParticipantListVisibilityStorageService = {
  getVisibilityMode(): 'all_visible' | 'focus_speaker' {
    const mode = getMockItem<'all_visible' | 'focus_speaker'>('participantListVisibilityMode');
    return mode || 'all_visible';
  },
  
  saveVisibilityMode(mode: 'all_visible' | 'focus_speaker'): boolean {
    try {
      setMockItem('participantListVisibilityMode', mode);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export const mockTimerConfigStorageService = {
  getTimerConfig(): StoredTimerConfig {
    const config = getMockItem<StoredTimerConfig>('timerSetupConfig');
    return config || { 
      mode: 'fixed', 
      totalDurationMinutes: 15, 
      allowExtension: false 
    };
  },
  
  saveTimerConfig(config: StoredTimerConfig): boolean {
    try {
      setMockItem('timerSetupConfig', config);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export const mockComponentVisibilityStorageService = {
  getVisibilityConfig(): ComponentVisibilityConfig {
    const config = getMockItem<ComponentVisibilityConfig>('meetingComponentsConfig');
    return config || { visibleComponents: ['timer'] };
  },
  
  saveVisibilityConfig(config: ComponentVisibilityConfig): boolean {
    try {
      setMockItem('meetingComponentsConfig', config);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export const mockLayoutStorageService = {
  getLayoutConfig(): LayoutConfiguration {
    const config = getMockItem<LayoutConfiguration>('meetingLayoutConfig');
    return config || DEFAULT_LAYOUT_CONFIG;
  },
  
  saveLayoutConfig(config: LayoutConfiguration): boolean {
    try {
      setMockItem('meetingLayoutConfig', config);
      return true;
    } catch (error) {
      return false;
    }
  }
};

import { storageService } from './storageService';
import type { KickoffSetting } from '../contexts/MeetingContext';

const KICKOFF_SETTING_KEY = 'kickoffSetting';

/**
 * Default kickoff settings
 */
export const DEFAULT_KICKOFF_SETTINGS: KickoffSetting = {
  mode: 'getDownToBusiness',
  storyOption: null,
  storyDurationSeconds: undefined, // Default to undefined
  storytellerName: '',           // Default to empty string
};

/**
 * Service for storing and retrieving kickoff settings
 */
export const kickoffSettingsStorageService = {
  /**
   * Get kickoff settings from storage
   * @returns The kickoff settings or default values if none is stored
   */
  getKickoffSettings(): KickoffSetting {
    return storageService.get<KickoffSetting>(
      KICKOFF_SETTING_KEY,
      DEFAULT_KICKOFF_SETTINGS,
      {
        validate: (value): value is KickoffSetting => {
          if (value === null || typeof value !== 'object') return false;
          if (!('mode' in value) || ((value as any).mode !== 'getDownToBusiness' && (value as any).mode !== 'storyTime')) return false;
          if ((value as any).mode === 'storyTime') {
            if (!('storyOption' in value) || ((value as any).storyOption !== 'random' && (value as any).storyOption !== 'manual')) return false;
            if (typeof (value as any).storyDurationSeconds !== 'number' || (value as any).storyDurationSeconds <= 0) return false;
            if ((value as any).storyOption === 'manual' && (typeof (value as any).storytellerName !== 'string' || (value as any).storytellerName.trim() === '')) return false;
          }
          return true;
        },
        migrate: (legacyData: any): KickoffSetting => {
          // Handle migration from older formats if needed
          if (legacyData && typeof legacyData === 'object') {
            const mode = 
              (legacyData as any).mode === 'storyTime' ? 'storyTime' : 'getDownToBusiness';
              
            const storyOptionValue = (legacyData as any).storyOption;
            const storyOption = 
              mode === 'storyTime' && 
              (storyOptionValue === 'random' || storyOptionValue === 'manual') 
                ? storyOptionValue 
                : null;

            const durationValue = (legacyData as any).storyDurationSeconds;
            const storyDurationSeconds = 
              mode === 'storyTime' && typeof durationValue === 'number'
                ? durationValue
                : DEFAULT_KICKOFF_SETTINGS.storyDurationSeconds;

            const nameValue = (legacyData as any).storytellerName;
            const storytellerName = 
              mode === 'storyTime' && storyOption === 'manual' && typeof nameValue === 'string'
                ? nameValue
                : DEFAULT_KICKOFF_SETTINGS.storytellerName;
                
            return { mode, storyOption, storyDurationSeconds, storytellerName };
          }
          return DEFAULT_KICKOFF_SETTINGS;
        }
      }
    );
  },
  
  /**
   * Save kickoff settings to storage
   * @param settings The kickoff settings to save
   * @returns true if saved successfully, false otherwise
   */
  saveKickoffSettings(settings: KickoffSetting): boolean {
    return storageService.set(KICKOFF_SETTING_KEY, settings);
  }
};

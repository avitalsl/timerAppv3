import { storageService } from './storageService';
import type { KickoffSetting } from '../contexts/MeetingContext';

const KICKOFF_SETTING_KEY = 'kickoffSetting';

/**
 * Default kickoff settings
 */
export const DEFAULT_KICKOFF_SETTINGS: KickoffSetting = {
  mode: 'getDownToBusiness',
  storyOption: null,
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
          return value !== null && 
                 typeof value === 'object' && 
                 'mode' in value && 
                 (value.mode === 'getDownToBusiness' || value.mode === 'storyTime');
        },
        migrate: (legacyData: any): KickoffSetting => {
          // Handle migration from older formats if needed
          if (legacyData && typeof legacyData === 'object') {
            const mode = 
              legacyData.mode === 'storyTime' ? 'storyTime' : 'getDownToBusiness';
              
            const storyOption = 
              mode === 'storyTime' && 
              (legacyData.storyOption === 'random' || legacyData.storyOption === 'manual') 
                ? legacyData.storyOption 
                : null;
                
            return { mode, storyOption };
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

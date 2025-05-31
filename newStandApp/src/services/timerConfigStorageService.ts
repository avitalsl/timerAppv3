import { storageService } from './storageService';
import type { StoredTimerConfig } from '../contexts/MeetingContext';

const TIMER_CONFIG_KEY = 'timerSetupConfig';

/**
 * Default timer configuration values
 */
export const DEFAULT_TIMER_CONFIG: StoredTimerConfig = {
  mode: 'fixed',
  totalDurationMinutes: 10,
  allowExtension: false,
  extensionAmountSeconds: 300, // 5 minutes in seconds
};

/**
 * Service for storing and retrieving timer configuration
 */
export const timerConfigStorageService = {
  /**
   * Get timer configuration from storage
   * @returns The timer configuration or default values if none is stored
   */
  getTimerConfig(): StoredTimerConfig {
    return storageService.get<StoredTimerConfig>(
      TIMER_CONFIG_KEY,
      DEFAULT_TIMER_CONFIG,
      {
        validate: (value): value is StoredTimerConfig => {
          return value !== null && 
                 typeof value === 'object' && 
                 'mode' in value && 
                 'allowExtension' in value;
        },
        migrate: (legacyData: any): StoredTimerConfig => {
          // Handle migration from older formats if needed
          const config: StoredTimerConfig = { ...DEFAULT_TIMER_CONFIG };
          
          if (legacyData) {
            // Copy known properties
            if ('mode' in legacyData) config.mode = legacyData.mode;
            if ('totalDurationMinutes' in legacyData) config.totalDurationMinutes = legacyData.totalDurationMinutes;
            if ('perParticipantMinutes' in legacyData) config.perParticipantMinutes = legacyData.perParticipantMinutes;
            if ('durationPerParticipantSeconds' in legacyData) config.durationPerParticipantSeconds = legacyData.durationPerParticipantSeconds;
            if ('allowExtension' in legacyData) config.allowExtension = legacyData.allowExtension;
            
            // Handle extension amount with proper unit conversion
            if ('extensionAmountSeconds' in legacyData) {
              config.extensionAmountSeconds = legacyData.extensionAmountSeconds;
            } else if ('extensionAmountMinutes' in legacyData) {
              config.extensionAmountSeconds = legacyData.extensionAmountMinutes * 60;
            }
          }
          
          return config;
        }
      }
    );
  },
  
  /**
   * Save timer configuration to storage
   * @param config The timer configuration to save
   * @returns true if saved successfully, false otherwise
   */
  saveTimerConfig(config: StoredTimerConfig): boolean {
    return storageService.set(TIMER_CONFIG_KEY, config);
  }
};

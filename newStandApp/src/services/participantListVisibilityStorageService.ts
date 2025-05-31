import { storageService } from './storageService';

const PARTICIPANT_LIST_VISIBILITY_KEY = 'participantListVisibilityMode';

/**
 * Type definition for participant list visibility modes
 */
export type ParticipantListVisibilityMode = 'all_visible' | 'focus_speaker';

/**
 * Default participant list visibility mode
 */
export const DEFAULT_PARTICIPANT_LIST_VISIBILITY_MODE: ParticipantListVisibilityMode = 'all_visible';

/**
 * Service for storing and retrieving participant list visibility mode
 */
export const participantListVisibilityStorageService = {
  /**
   * Get participant list visibility mode from storage
   * @returns The visibility mode or default value if none is stored
   */
  getVisibilityMode(): ParticipantListVisibilityMode {
    return storageService.get<ParticipantListVisibilityMode>(
      PARTICIPANT_LIST_VISIBILITY_KEY,
      DEFAULT_PARTICIPANT_LIST_VISIBILITY_MODE,
      {
        validate: (value): value is ParticipantListVisibilityMode => {
          return value === 'all_visible' || value === 'focus_speaker';
        }
      }
    );
  },
  
  /**
   * Save participant list visibility mode to storage
   * @param mode The visibility mode to save
   * @returns true if saved successfully, false otherwise
   */
  saveVisibilityMode(mode: ParticipantListVisibilityMode): boolean {
    return storageService.set(PARTICIPANT_LIST_VISIBILITY_KEY, mode);
  }
};

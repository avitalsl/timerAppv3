import { storageService } from './storageService';
import type { Participant } from '../contexts/MeetingContext';

const PARTICIPANTS_KEY = 'participantsList';

/**
 * Default empty participants list
 */
export const DEFAULT_PARTICIPANTS: Participant[] = [];

/**
 * Service for storing and retrieving participants list
 */
export const participantsStorageService = {
  /**
   * Get participants list from storage
   * @returns The participants list or empty array if none is stored
   */
  getParticipants(): Participant[] {
    return storageService.get<Participant[]>(
      PARTICIPANTS_KEY,
      DEFAULT_PARTICIPANTS,
      {
        validate: (value): value is Participant[] => {
          return Array.isArray(value) && 
                 value.every(item => 
                   typeof item === 'object' && 
                   'name' in item && 
                   'included' in item
                 );
        },
        migrate: (legacyData: any): Participant[] => {
          // Handle migration from older formats
          if (Array.isArray(legacyData)) {
            return legacyData.map(item => {
              // Ensure each item has the required structure
              const participant: Participant = {
                name: typeof item.name === 'string' ? item.name : '',
                included: typeof item.included === 'boolean' ? item.included : true
              };
              return participant;
            }).filter(p => p.name); // Filter out participants with empty names
          }
          return DEFAULT_PARTICIPANTS;
        }
      }
    );
  },
  
  /**
   * Save participants list to storage
   * @param participants The participants list to save
   * @returns true if saved successfully, false otherwise
   */
  saveParticipants(participants: Participant[]): boolean {
    return storageService.set(PARTICIPANTS_KEY, participants);
  }
};

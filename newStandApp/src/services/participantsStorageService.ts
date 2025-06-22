import { storageService } from './storageService';
import type { Participant } from '../contexts/MeetingContext';
import { ParticipantStatus } from '../contexts/MeetingContext';
import { v4 as uuidv4 } from 'uuid';  

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
                   'id' in item &&
                   'name' in item && 
                   'included' in item &&
                   'allocatedTimeSeconds' in item &&
                   'remainingTimeSeconds' in item &&
                   'usedTimeSeconds' in item &&
                   'donatedTimeSeconds' in item &&
                   'receivedTimeSeconds' in item &&
                   'status' in item &&
                   'hasSpeakerRole' in item
                 );
        },
        migrate: (legacyData: any): Participant[] => {
          // Handle migration from older formats
          if (Array.isArray(legacyData)) {
            return legacyData.map(item => {
              // Ensure each item has the required structure
              const participant: Participant = {
                id: item.id || uuidv4(), 
                name: typeof item.name === 'string' ? item.name : '',
                included: typeof item.included === 'boolean' ? item.included : true,
                // Initialize time properties to ensure they are never undefined
                allocatedTimeSeconds: typeof item.allocatedTimeSeconds === 'number' ? item.allocatedTimeSeconds : 0,
                remainingTimeSeconds: typeof item.remainingTimeSeconds === 'number' ? item.remainingTimeSeconds : 0,
                usedTimeSeconds: typeof item.usedTimeSeconds === 'number' ? item.usedTimeSeconds : 0,
                donatedTimeSeconds: typeof item.donatedTimeSeconds === 'number' ? item.donatedTimeSeconds : 0,
                receivedTimeSeconds: typeof item.receivedTimeSeconds === 'number' ? item.receivedTimeSeconds : 0,
                // Initialize status fields
                status: item.status !== undefined ? item.status : ParticipantStatus.PENDING,
                hasSpeakerRole: typeof item.hasSpeakerRole === 'boolean' ? item.hasSpeakerRole : false
              };
              return participant;
            }).filter(p => p.name); 
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

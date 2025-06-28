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
          if (!Array.isArray(value)) {
            return false;
          }
          
          return value.every(item => 
            item !== null &&
            typeof item === 'object' && 
            'id' in item && typeof item.id === 'string' &&
            'name' in item && typeof item.name === 'string' &&
            'included' in item && typeof item.included === 'boolean' &&
            'allocatedTimeSeconds' in item && typeof item.allocatedTimeSeconds === 'number' &&
            'remainingTimeSeconds' in item && typeof item.remainingTimeSeconds === 'number' &&
            'usedTimeSeconds' in item && typeof item.usedTimeSeconds === 'number' &&
            'status' in item &&
            'hasSpeakerRole' in item && typeof item.hasSpeakerRole === 'boolean' &&
            'type' in item && typeof item.type === 'string' && 
            (item.type === 'interactive' || item.type === 'viewOnly' || item.type === 'storytime')
          );
        },
        migrate: (legacyData: any): Participant[] => {
          // Handle migration from older formats
          if (Array.isArray(legacyData)) {
            // Filter out null/undefined items and those with empty names first
            return legacyData
              .filter(item => item && typeof item === 'object' && item.name)
              .map(item => {
                // Ensure each item has the required structure
                return {
                  // Generate a new ID if missing or invalid
                  id: item.id && typeof item.id === 'string' ? item.id : uuidv4(),
                  name: typeof item.name === 'string' ? item.name : '',
                  included: typeof item.included === 'boolean' ? item.included : true,
                  // Initialize time properties to ensure they are never undefined
                  allocatedTimeSeconds: typeof item.allocatedTimeSeconds === 'number' ? item.allocatedTimeSeconds : 0,
                  remainingTimeSeconds: typeof item.remainingTimeSeconds === 'number' ? item.remainingTimeSeconds : 0,
                  usedTimeSeconds: typeof item.usedTimeSeconds === 'number' ? item.usedTimeSeconds : 0,
                  // Initialize status fields with proper defaults
                  status: Object.values(ParticipantStatus).includes(item.status) ? 
                    item.status : ParticipantStatus.PENDING,
                  hasSpeakerRole: typeof item.hasSpeakerRole === 'boolean' ? item.hasSpeakerRole : false,
                  // Add new fields with defaults
                  type: typeof item.type === 'string' ? item.type : 'viewOnly',
                  email: item.email || undefined,
                  userId: item.userId || undefined
                };
              });
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

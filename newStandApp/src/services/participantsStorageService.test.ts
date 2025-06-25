import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { participantsStorageService, DEFAULT_PARTICIPANTS } from './participantsStorageService';
import { storageService } from './storageService';
import { ParticipantStatus } from '../contexts/MeetingContext';
import type { Participant } from '../contexts/MeetingContext';
import { v4 as uuidv4 } from 'uuid';

// Mock the uuid module to return predictable values
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mocked-uuid')
}));

// Mock the storageService
vi.mock('./storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn()
  }
}));

describe('participantsStorageService', () => {
  // Helper to create a valid participant for testing
  const createMockParticipant = (overrides = {}): Participant => ({
    id: 'test-id',
    name: 'Test User',
    included: true,
    allocatedTimeSeconds: 120,
    remainingTimeSeconds: 90,
    usedTimeSeconds: 30,
    status: ParticipantStatus.PENDING,
    hasSpeakerRole: false,
    type: 'interactive',
    email: 'test@example.com',
    userId: 'user-123',
    ...overrides
  });

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Clean up after tests
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getParticipants', () => {
    it('should return DEFAULT_PARTICIPANTS when storage is empty', () => {
      // Setup mock to simulate empty storage
      vi.mocked(storageService.get).mockReturnValue(DEFAULT_PARTICIPANTS);
      
      // Call the function
      const result = participantsStorageService.getParticipants();
      
      // Verify results
      expect(result).toBe(DEFAULT_PARTICIPANTS);
      expect(storageService.get).toHaveBeenCalledWith(
        'participantsList',
        DEFAULT_PARTICIPANTS,
        expect.objectContaining({
          validate: expect.any(Function),
          migrate: expect.any(Function)
        })
      );
    });

    it('should return valid data from storage', () => {
      // Setup valid participants data
      const validParticipants = [createMockParticipant(), createMockParticipant({ id: 'test-id-2' })];
      
      // Mock storage to return valid data
      vi.mocked(storageService.get).mockReturnValue(validParticipants);
      
      // Call the function
      const result = participantsStorageService.getParticipants();
      
      // Verify results
      expect(result).toBe(validParticipants);
    });

    describe('validation', () => {
      // Extract the validate function for testing
      let validateFn: (value: unknown) => boolean;
      
      beforeEach(() => {
        participantsStorageService.getParticipants();
        validateFn = vi.mocked(storageService.get).mock.calls[0][2]?.validate as any;
      });

      it('should validate a properly formed participants array', () => {
        const validParticipants = [createMockParticipant()];
        expect(validateFn(validParticipants)).toBe(true);
      });

      it('should reject non-array values', () => {
        expect(validateFn({})).toBe(false);
        expect(validateFn('not an array')).toBe(false);
        expect(validateFn(null)).toBe(false);
      });

      it('should reject arrays with invalid participant objects', () => {
        // Missing required fields
        expect(validateFn([{ id: 'test' }])).toBe(false);
        
        // Wrong data types
        expect(validateFn([{
          id: 'test-id',
          name: 123, // Should be string
          included: true,
          allocatedTimeSeconds: 120,
          remainingTimeSeconds: 90,
          usedTimeSeconds: 30,
          status: ParticipantStatus.PENDING,
          hasSpeakerRole: false,
          type: 'interactive'
        }])).toBe(false);
        
        // Missing required fields
        expect(validateFn([{
          id: 'test-id',
          name: 'Test User',
          included: true,
          // Missing allocatedTimeSeconds
          remainingTimeSeconds: 90,
          usedTimeSeconds: 30,
          status: ParticipantStatus.PENDING,
          hasSpeakerRole: false,
          // Missing type
        }])).toBe(false);
      });
    });

    describe('migration', () => {
      // Extract the migrate function for testing
      let migrateFn: (legacyData: any) => Participant[];
      
      beforeEach(() => {
        participantsStorageService.getParticipants();
        migrateFn = vi.mocked(storageService.get).mock.calls[0][2]?.migrate as any;
      });

      it('should return DEFAULT_PARTICIPANTS for non-array data', () => {
        expect(migrateFn(null)).toEqual(DEFAULT_PARTICIPANTS);
        expect(migrateFn({})).toEqual(DEFAULT_PARTICIPANTS);
        expect(migrateFn('string')).toEqual(DEFAULT_PARTICIPANTS);
      });

      it('should migrate legacy data with missing fields', () => {
        const legacyData = [{
          id: 'legacy-id',
          name: 'Legacy User',
          included: true,
          allocatedTimeSeconds: 120,
          remainingTimeSeconds: 90,
          usedTimeSeconds: 30,
          status: ParticipantStatus.PENDING,
          hasSpeakerRole: false
          // Missing type, userId, email
        }];

        const result = migrateFn(legacyData);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          id: 'legacy-id',
          name: 'Legacy User',
          included: true,
          allocatedTimeSeconds: 120,
          remainingTimeSeconds: 90,
          usedTimeSeconds: 30,
          status: ParticipantStatus.PENDING,
          hasSpeakerRole: false,
          type: 'viewOnly', // Default value
          email: undefined,
          userId: undefined
        });
      });

      it('should generate new ID if missing', () => {
        const legacyData = [{
          // Missing id
          name: 'No ID User',
          included: true,
          allocatedTimeSeconds: 120,
          remainingTimeSeconds: 90,
          usedTimeSeconds: 30,
          status: ParticipantStatus.PENDING,
          hasSpeakerRole: false
        }];

        const result = migrateFn(legacyData);
        
        expect(result[0].id).toBe('mocked-uuid');
        expect(uuidv4).toHaveBeenCalled();
      });

      it('should handle malformed data and apply defaults', () => {
        const malformedData = [{
          id: 'malformed-id',
          name: 'Malformed User',
          included: 'not-a-boolean', // Wrong type
          // Missing allocatedTimeSeconds
          remainingTimeSeconds: 'not-a-number', // Wrong type
          usedTimeSeconds: null, // Wrong type
          status: 'invalid-status', // Invalid enum
          hasSpeakerRole: 1 // Wrong type
        }];

        const result = migrateFn(malformedData as any);
        
        expect(result[0]).toEqual({
          id: 'malformed-id',
          name: 'Malformed User',
          included: true, // Default
          allocatedTimeSeconds: 0, // Default
          remainingTimeSeconds: 0, // Default
          usedTimeSeconds: 0, // Default
          status: ParticipantStatus.PENDING, // Default
          hasSpeakerRole: false, // Default
          type: 'viewOnly', // Default
          email: undefined,
          userId: undefined
        });
      });

      it('should filter out participants with empty names', () => {
        const mixedData = [
          { id: 'valid-id', name: 'Valid User', included: true },
          { id: 'empty-name', name: '', included: true },
          { id: 'null-name', name: null, included: true },
          { id: 'valid-id-2', name: 'Another Valid', included: true }
        ];

        const result = migrateFn(mixedData);
        
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Valid User');
        expect(result[1].name).toBe('Another Valid');
      });
    });
  });

  describe('saveParticipants', () => {
    it('should save participants to storage', () => {
      // Setup mock to return success
      vi.mocked(storageService.set).mockReturnValue(true);
      
      // Create test data
      const participants = [createMockParticipant()];
      
      // Call the function
      const result = participantsStorageService.saveParticipants(participants);
      
      // Verify results
      expect(result).toBe(true);
      expect(storageService.set).toHaveBeenCalledWith('participantsList', participants);
    });

    it('should handle storage failures', () => {
      // Setup mock to return failure
      vi.mocked(storageService.set).mockReturnValue(false);
      
      // Create test data
      const participants = [createMockParticipant()];
      
      // Call the function
      const result = participantsStorageService.saveParticipants(participants);
      
      // Verify results
      expect(result).toBe(false);
      expect(storageService.set).toHaveBeenCalledWith('participantsList', participants);
    });
  });
});

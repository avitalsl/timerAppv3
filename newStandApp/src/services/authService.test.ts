import { describe, it, expect } from 'vitest';
import { authService } from './index';
import type { Participant } from '../contexts/MeetingContext';
import type { AppUser } from '../types/userTypes';

describe('authService', () => {
  // Sample data for tests
  const mockParticipants: Participant[] = [
    {
      id: 'p1',
      name: 'John Doe',
      included: true,
      allocatedTimeSeconds: 120,
      remainingTimeSeconds: 120,
      usedTimeSeconds: 0,
      status: 'PENDING',
      hasSpeakerRole: false,
      type: 'viewOnly',
      email: 'john.doe@example.com'
    },
    {
      id: 'p2',
      name: 'Jane Smith',
      included: true,
      allocatedTimeSeconds: 120,
      remainingTimeSeconds: 120,
      usedTimeSeconds: 0,
      status: 'PENDING',
      hasSpeakerRole: false,
      type: 'viewOnly'
      // No email for this participant
    }
  ];

  const mockUser: AppUser = {
    id: 'user1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    type: 'interactive',
    isAuthenticated: true
  };

  describe('matchParticipantByEmail', () => {
    it('should find a participant with matching email', () => {
      const result = authService.matchParticipantByEmail('john.doe@example.com', mockParticipants);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('p1');
    });

    it('should match email case-insensitively', () => {
      const result = authService.matchParticipantByEmail('JOHN.DOE@example.com', mockParticipants);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('p1');
    });

    it('should return null if no email match is found', () => {
      const result = authService.matchParticipantByEmail('no.match@example.com', mockParticipants);
      expect(result).toBeNull();
    });

    it('should return null if email is empty', () => {
      const result = authService.matchParticipantByEmail('', mockParticipants);
      expect(result).toBeNull();
    });
  });

  describe('updateParticipantFromUser', () => {
    it('should update participant with user information', () => {
      const participant = mockParticipants[0];
      const result = authService.updateParticipantFromUser(participant, mockUser);
      
      expect(result).toEqual({
        ...participant,
        type: 'interactive',
        email: mockUser.email,
        userId: mockUser.id
      });
    });

    it('should preserve existing participant properties', () => {
      const participant = mockParticipants[0];
      const result = authService.updateParticipantFromUser(participant, mockUser);
      
      expect(result.allocatedTimeSeconds).toBe(participant.allocatedTimeSeconds);
      expect(result.remainingTimeSeconds).toBe(participant.remainingTimeSeconds);
      expect(result.name).toBe(participant.name);
    });
  });

  describe('createParticipantFromUser', () => {
    it('should create a new participant from user information', () => {
      const result = authService.createParticipantFromUser(mockUser);
      
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
      expect(result.userId).toBe(mockUser.id);
      expect(result.type).toBe('interactive');
      expect(result.included).toBe(true);
      expect(typeof result.id).toBe('string');
    });

    it('should set default values for time-related properties', () => {
      const result = authService.createParticipantFromUser(mockUser);
      
      expect(result.allocatedTimeSeconds).toBe(120);
      expect(result.remainingTimeSeconds).toBe(120);
      expect(result.usedTimeSeconds).toBe(0);
    });
  });
});

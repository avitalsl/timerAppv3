import { describe, it, expect } from 'vitest';
import { meetingTimerService } from './meetingTimerService';
import { ParticipantStatus } from '../contexts/MeetingContext';
import type { Participant, MeetingState } from '../contexts/MeetingContext';

describe('meetingTimerService', () => {
  // Mock participant data
  const createMockParticipant = (overrides = {}): Participant => ({
    id: 'test-id',
    name: 'Test User',
    included: true,
    allocatedTimeSeconds: 120,
    remainingTimeSeconds: 90,
    usedTimeSeconds: 30,
    status: ParticipantStatus.ACTIVE,
    hasSpeakerRole: true,
    type: 'interactive', // Add required type field
    ...overrides
  });

  // Mock meeting state
  const createMockState = (overrides = {}): MeetingState => ({
    isMeetingActive: true,
    isMeetingUIVisible: true,
    timerStatus: 'running',
    timerConfig: {
      mode: 'per-participant',
      durationSeconds: 120, // Duration per participant
      allowExtension: true,
      extensionAmountSeconds: 30
    },
    currentSpeakerId: 'participant-1',
    currentTimeSeconds: 90,
    participants: [
      {
        id: 'participant-1',
        name: 'Alice',
        included: true,
        allocatedTimeSeconds: 120,
        remainingTimeSeconds: 90,
        usedTimeSeconds: 30,
        status: ParticipantStatus.ACTIVE,
        hasSpeakerRole: true,
        type: 'interactive' // Add required type field
      },
      {
        id: 'participant-2',
        name: 'Bob',
        included: true,
        allocatedTimeSeconds: 120,
        remainingTimeSeconds: 120,
        usedTimeSeconds: 0,
        status: ParticipantStatus.PENDING,
        hasSpeakerRole: false,
        type: 'viewOnly' // Add required type field
      },
      {
        id: 'participant-3',
        name: 'Charlie',
        included: true,
        allocatedTimeSeconds: 120,
        remainingTimeSeconds: 0,
        usedTimeSeconds: 120,
        status: ParticipantStatus.FINISHED,
        hasSpeakerRole: false,
        type: 'viewOnly' // Add required type field
      }
    ],
    speakerQueue: ['participant-2'],
    // Additional required properties
    kickoffSettings: {
      mode: 'getDownToBusiness',
      storyOption: null,
      storyDurationSeconds: undefined,
      storytellerName: ''
    },
    currentParticipantIndex: 0,
    selectedGridComponentIds: [],
    participantListVisibilityMode: 'all_visible',
    meetingStatus: 'InProgress',
    ...overrides
  });

  describe('canDonateTime', () => {
    it('should allow donation when user has more than 10 seconds remaining', () => {
      const participant = createMockParticipant({
        status: ParticipantStatus.PENDING,
        remainingTimeSeconds: 60
      });
      
      const result = meetingTimerService.canDonateTime(participant);
      expect(result.canDonate).toBe(true);
      expect(result.maxAmount).toBe(10);
    });

    it('should not allow donation when user has 10 or fewer seconds remaining', () => {
      const participant = createMockParticipant({
        remainingTimeSeconds: 10
      });
      
      const result = meetingTimerService.canDonateTime(participant);
      expect(result.canDonate).toBe(false);
      expect(result.maxAmount).toBe(0);
    });

    it('should not allow donation for active speakers', () => {
      const participant = createMockParticipant({
        remainingTimeSeconds: 60,
        status: ParticipantStatus.ACTIVE
      });
      
      const result = meetingTimerService.canDonateTime(participant);
      expect(result.canDonate).toBe(false);
      expect(result.maxAmount).toBe(0);
    });
  });

  describe('donateTime', () => {
    it('should process a valid donation correctly', () => {
      const state = createMockState();
      const result = meetingTimerService.donateTime(state, 'participant-2');
      
      // Check that the donor's time was reduced
      const updatedDonor = result.participants.find(p => p.id === 'participant-2');
      expect(updatedDonor?.remainingTimeSeconds).toBe(110); // 120 - 10
      
      // Check that the recipient's time was increased
      const updatedRecipient = result.participants.find(p => p.id === 'participant-1');
      expect(updatedRecipient?.remainingTimeSeconds).toBe(100); // 90 + 10
      
      // Check that the current time was also updated
      expect(result.currentTimeSeconds).toBe(100); // 90 + 10
    });

    it('should return original state if donor not found', () => {
      const state = createMockState();
      const result = meetingTimerService.donateTime(state, 'non-existent');
      
      expect(result).toBe(state);
    });

    it('should return original state if no current speaker', () => {
      const state = createMockState({
        currentSpeakerId: null
      });
      const result = meetingTimerService.donateTime(state, 'participant-2');
      
      expect(result).toBe(state);
    });

    it('should return original state if donor cannot donate', () => {
      const baseState = createMockState();
      const state = createMockState({
        participants: baseState.participants.map(p => 
          p.id === 'participant-2' ? { ...p, remainingTimeSeconds: 5 } : p
        )
      });
      
      const result = meetingTimerService.donateTime(state, 'participant-2');
      
      expect(result).toBe(state);
    });
  });

  describe('moveToNextParticipant', () => {
    it('should move to the next pending participant', () => {
      const state = createMockState();
      const result = meetingTimerService.moveToNextParticipant(state);
      
      // Previous speaker should be marked as finished
      const previousSpeaker = result.participants.find(p => p.id === 'participant-1');
      expect(previousSpeaker?.status).toBe(ParticipantStatus.FINISHED);
      expect(previousSpeaker?.hasSpeakerRole).toBe(false);
      
      // Next speaker should be active
      expect(result.currentSpeakerId).toBe('participant-2');
      const nextSpeaker = result.participants.find(p => p.id === 'participant-2');
      expect(nextSpeaker?.status).toBe(ParticipantStatus.ACTIVE);
      expect(nextSpeaker?.hasSpeakerRole).toBe(true);
      
      // Speaker queue should be updated
      expect(result.speakerQueue.length).toBe(0);
      
      // Timer should be reset to the new speaker's total available time
      expect(result.currentTimeSeconds).toBe(120);
      expect(result.timerStatus).toBe('running');
    });

    it('should handle case when no more pending participants', () => {
      const state = createMockState({
        participants: [
          {
            id: 'participant-1',
            name: 'Alice',
            included: true,
            allocatedTimeSeconds: 120,
            remainingTimeSeconds: 90,
            usedTimeSeconds: 30,
            status: ParticipantStatus.ACTIVE,
            hasSpeakerRole: true,
            type: 'interactive'
          },
          {
            id: 'participant-2',
            name: 'Bob',
            included: true,
            allocatedTimeSeconds: 120,
            remainingTimeSeconds: 0,
            usedTimeSeconds: 120,
            status: ParticipantStatus.FINISHED,
            hasSpeakerRole: false,
            type: 'viewOnly'
          },
          {
            id: 'participant-3',
            name: 'Charlie',
            included: true,
            allocatedTimeSeconds: 120,
            remainingTimeSeconds: 0,
            usedTimeSeconds: 120,
            status: ParticipantStatus.FINISHED,
            hasSpeakerRole: false,
            type: 'viewOnly'
          }
        ],
        speakerQueue: []
      });
      
      const result = meetingTimerService.moveToNextParticipant(state);
      
      // Previous speaker should be marked as finished
      const previousSpeaker = result.participants.find(p => p.id === 'participant-1');
      expect(previousSpeaker?.status).toBe(ParticipantStatus.FINISHED);
      expect(previousSpeaker?.hasSpeakerRole).toBe(false);
      
      // No current speaker
      expect(result.currentSpeakerId).toBeNull();
      
      // Timer status should be finished
      expect(result.timerStatus).toBe('finished');
    });
  });

  describe('skipParticipant', () => {
    it('should mark a participant as skipped', () => {
      const state = createMockState();
      const result = meetingTimerService.skipParticipant(state, 'participant-2');
      
      // Participant should be marked as skipped
      const skippedParticipant = result.participants.find(p => p.id === 'participant-2');
      expect(skippedParticipant?.status).toBe(ParticipantStatus.SKIPPED);
      expect(skippedParticipant?.hasSpeakerRole).toBe(false);
      
      // Speaker queue should be updated
      expect(result.speakerQueue.length).toBe(0);
    });

    it('should move to next speaker if current speaker is skipped', () => {
      const state = createMockState();
      const result = meetingTimerService.skipParticipant(state, 'participant-1');
      
      // Skipped speaker should be marked as finished
      const skippedSpeaker = result.participants.find(p => p.id === 'participant-1');
      expect(skippedSpeaker?.status).toBe(ParticipantStatus.FINISHED);
      expect(skippedSpeaker?.hasSpeakerRole).toBe(false);
      
      // Next speaker should be active
      expect(result.currentSpeakerId).toBe('participant-2');
      const nextSpeaker = result.participants.find(p => p.id === 'participant-2');
      expect(nextSpeaker?.status).toBe(ParticipantStatus.ACTIVE);
    });

    it('should return original state if participant not found', () => {
      const state = createMockState();
      const result = meetingTimerService.skipParticipant(state, 'non-existent');
      
      expect(result).toBe(state);
    });
  });

  describe('processTick', () => {
    it('should decrement time for fixed-mode timer', () => {
      const state = createMockState({
        timerConfig: {
          mode: 'fixed',
          durationSeconds: 120,
          allowExtension: false
        },
        currentSpeakerId: null,
        currentTimeSeconds: 100
      });
      
      const result = meetingTimerService.processTick(state);
      
      expect(result.currentTimeSeconds).toBe(99);
    });

    it('should update current speaker time in per-participant mode', () => {
      const state = createMockState();
      const result = meetingTimerService.processTick(state);
      
      // Current time should decrease
      expect(result.currentTimeSeconds).toBe(89);
      
      // Speaker's remaining and used time should be updated
      const updatedSpeaker = result.participants.find(p => p.id === 'participant-1');
      expect(updatedSpeaker?.remainingTimeSeconds).toBe(89);
      expect(updatedSpeaker?.usedTimeSeconds).toBe(31);
    });

    it('should move to next speaker when time is up', () => {
      const state = createMockState({
        currentTimeSeconds: 1,
        participants: [
          {
            id: 'participant-1',
            name: 'Alice',
            included: true,
            allocatedTimeSeconds: 120,
            remainingTimeSeconds: 1,
            usedTimeSeconds: 119,
            status: ParticipantStatus.ACTIVE,
            hasSpeakerRole: true,
            type: 'interactive'
          },
          {
            id: 'participant-2',
            name: 'Bob',
            included: true,
            allocatedTimeSeconds: 120,
            remainingTimeSeconds: 120,
            usedTimeSeconds: 0,
            status: ParticipantStatus.PENDING,
            hasSpeakerRole: false,
            type: 'viewOnly'
          }
        ]
      });
      
      const result = meetingTimerService.processTick(state);
      
      // Previous speaker should be finished
      const previousSpeaker = result.participants.find(p => p.id === 'participant-1');
      expect(previousSpeaker?.status).toBe(ParticipantStatus.FINISHED);
      
      // Next speaker should be active
      expect(result.currentSpeakerId).toBe('participant-2');
      const nextSpeaker = result.participants.find(p => p.id === 'participant-2');
      expect(nextSpeaker?.status).toBe(ParticipantStatus.ACTIVE);
    });

    it('should handle timer finished state in fixed mode', () => {
      const state = createMockState({
        timerConfig: {
          mode: 'fixed',
          durationSeconds: 120,
          allowExtension: false
        },
        currentSpeakerId: null,
        currentTimeSeconds: 1
      });
      
      const result = meetingTimerService.processTick(state);
      
      expect(result.currentTimeSeconds).toBe(0);
      expect(result.timerStatus).toBe('finished');
    });

    it('should not update time if meeting is not active', () => {
      const state = createMockState({
        isMeetingActive: false
      });
      
      const result = meetingTimerService.processTick(state);
      
      expect(result).toBe(state);
    });

    it('should not update time if timer is not running', () => {
      const state = createMockState({
        timerStatus: 'paused'
      });
      
      const result = meetingTimerService.processTick(state);
      
      expect(result).toBe(state);
    });

    it('should handle custom elapsed time', () => {
      const state = createMockState();
      const result = meetingTimerService.processTick(state, 5);
      
      expect(result.currentTimeSeconds).toBe(85);
      
      const updatedSpeaker = result.participants.find(p => p.id === 'participant-1');
      expect(updatedSpeaker?.remainingTimeSeconds).toBe(85);
      expect(updatedSpeaker?.usedTimeSeconds).toBe(35);
    });
  });
});

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
    donatedTimeSeconds: 10,
    receivedTimeSeconds: 20,
    status: ParticipantStatus.ACTIVE,
    hasSpeakerRole: true,
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
        donatedTimeSeconds: 0,
        receivedTimeSeconds: 0,
        status: ParticipantStatus.ACTIVE,
        hasSpeakerRole: true
      },
      {
        id: 'participant-2',
        name: 'Bob',
        included: true,
        allocatedTimeSeconds: 120,
        remainingTimeSeconds: 120,
        usedTimeSeconds: 0,
        donatedTimeSeconds: 0,
        receivedTimeSeconds: 0,
        status: ParticipantStatus.PENDING,
        hasSpeakerRole: false
      },
      {
        id: 'participant-3',
        name: 'Charlie',
        included: true,
        allocatedTimeSeconds: 120,
        remainingTimeSeconds: 0,
        usedTimeSeconds: 120,
        donatedTimeSeconds: 0,
        receivedTimeSeconds: 0,
        status: ParticipantStatus.FINISHED,
        hasSpeakerRole: false
      }
    ],
    speakerQueue: ['participant-2'],
    timeDonations: [],
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

  describe('calculateTotalAvailableTime', () => {
    it('should calculate total available time correctly', () => {
      const participant = createMockParticipant();
      const result = meetingTimerService.calculateTotalAvailableTime(participant);
      
      // 120 (allocated) + 20 (received) - 10 (donated) = 130
      expect(result).toBe(130);
    });

    it('should handle zero values correctly', () => {
      const participant = createMockParticipant({
        allocatedTimeSeconds: 60,
        receivedTimeSeconds: 0,
        donatedTimeSeconds: 0
      });
      
      const result = meetingTimerService.calculateTotalAvailableTime(participant);
      expect(result).toBe(60);
    });
  });

  describe('calculateRemainingTime', () => {
    it('should calculate remaining time correctly', () => {
      const participant = createMockParticipant();
      const result = meetingTimerService.calculateRemainingTime(participant);
      
      // 130 (total available) - 30 (used) = 100
      expect(result).toBe(100);
    });

    it('should handle zero used time correctly', () => {
      const participant = createMockParticipant({
        allocatedTimeSeconds: 60,
        receivedTimeSeconds: 15,
        donatedTimeSeconds: 5,
        usedTimeSeconds: 0
      });
      
      const result = meetingTimerService.calculateRemainingTime(participant);
      // 60 (allocated) + 15 (received) - 5 (donated) - 0 (used) = 70
      expect(result).toBe(70);
    });
  });

  describe('canDonateTime', () => {
    it('should allow PENDING participants to donate up to 10% of allocated time', () => {
      const participant = createMockParticipant({
        status: ParticipantStatus.PENDING,
        allocatedTimeSeconds: 120
      });
      
      const result = meetingTimerService.canDonateTime(participant);
      expect(result.canDonate).toBe(true);
      expect(result.maxAmount).toBe(12); // 10% of 120 = 12
    });

    it('should allow FINISHED participants to donate all remaining time', () => {
      const participant = createMockParticipant({
        status: ParticipantStatus.FINISHED,
        allocatedTimeSeconds: 120,
        usedTimeSeconds: 80,
        remainingTimeSeconds: 40
      });
      
      const result = meetingTimerService.canDonateTime(participant);
      expect(result.canDonate).toBe(true);
      expect(result.maxAmount).toBe(50); // 120 (allocated) + 20 (received) - 10 (donated) - 80 (used) = 50
    });

    it('should allow SKIPPED participants to donate all remaining time', () => {
      const participant = createMockParticipant({
        status: ParticipantStatus.SKIPPED,
        allocatedTimeSeconds: 120,
        usedTimeSeconds: 0,
        remainingTimeSeconds: 120
      });
      
      const result = meetingTimerService.canDonateTime(participant);
      expect(result.canDonate).toBe(true);
      expect(result.maxAmount).toBe(130); // 120 (allocated) + 20 (received) - 10 (donated) - 0 (used) = 130
    });

    it('should not allow ACTIVE participants to donate time', () => {
      const participant = createMockParticipant({
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
      const result = meetingTimerService.donateTime(state, 'participant-2', 'participant-1', 10);
      
      // Check that the donor's donated time increased
      const updatedDonor = result.participants.find(p => p.id === 'participant-2');
      expect(updatedDonor?.donatedTimeSeconds).toBe(10);
      
      // Check that the recipient's received time and remaining time increased
      const updatedRecipient = result.participants.find(p => p.id === 'participant-1');
      expect(updatedRecipient?.receivedTimeSeconds).toBe(10);
      expect(updatedRecipient?.remainingTimeSeconds).toBe(100); // 90 + 10
      
      // Check that the donation was recorded
      expect(result.timeDonations.length).toBe(1);
      expect(result.timeDonations[0].fromParticipantId).toBe('participant-2');
      expect(result.timeDonations[0].toParticipantId).toBe('participant-1');
      expect(result.timeDonations[0].amountSeconds).toBe(10);
    });

    it('should return original state if donor not found', () => {
      const state = createMockState();
      const result = meetingTimerService.donateTime(state, 'non-existent', 'participant-1', 10);
      
      expect(result).toBe(state);
    });

    it('should return original state if recipient not found', () => {
      const state = createMockState();
      const result = meetingTimerService.donateTime(state, 'participant-2', 'non-existent', 10);
      
      expect(result).toBe(state);
    });

    it('should return original state if donor cannot donate', () => {
      const state = createMockState();
      // Active participants cannot donate
      const result = meetingTimerService.donateTime(state, 'participant-1', 'participant-2', 10);
      
      expect(result).toBe(state);
    });

    it('should return original state if donation amount is invalid', () => {
      const state = createMockState();
      // Negative amount
      const result = meetingTimerService.donateTime(state, 'participant-2', 'participant-1', -5);
      
      expect(result).toBe(state);
    });

    it('should return original state if donation exceeds max allowed', () => {
      const state = createMockState();
      // Max for pending participant is 10% of allocated time (12 seconds)
      const result = meetingTimerService.donateTime(state, 'participant-2', 'participant-1', 20);
      
      expect(result).toBe(state);
    });
  });

  describe('moveToNextParticipant', () => {
    it('should move to the next pending participant', () => {
      const state = createMockState();
      const result = meetingTimerService.moveToNextParticipant(state);
      
      // Current speaker should be marked as FINISHED
      const previousSpeaker = result.participants.find(p => p.id === 'participant-1');
      expect(previousSpeaker?.status).toBe(ParticipantStatus.FINISHED);
      expect(previousSpeaker?.hasSpeakerRole).toBe(false);
      
      // Next speaker should be the one from the queue
      expect(result.currentSpeakerId).toBe('participant-2');
      const nextSpeaker = result.participants.find(p => p.id === 'participant-2');
      expect(nextSpeaker?.status).toBe(ParticipantStatus.ACTIVE);
      expect(nextSpeaker?.hasSpeakerRole).toBe(true);
      
      // Speaker queue should be updated (participant removed from queue)
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
            donatedTimeSeconds: 0,
            receivedTimeSeconds: 0,
            status: ParticipantStatus.ACTIVE,
            hasSpeakerRole: true
          },
          {
            id: 'participant-2',
            name: 'Bob',
            included: true,
            allocatedTimeSeconds: 120,
            remainingTimeSeconds: 0,
            usedTimeSeconds: 120,
            donatedTimeSeconds: 0,
            receivedTimeSeconds: 0,
            status: ParticipantStatus.FINISHED,
            hasSpeakerRole: false
          }
        ],
        speakerQueue: []
      });
      
      const result = meetingTimerService.moveToNextParticipant(state);
      
      // Current speaker should be marked as FINISHED
      const previousSpeaker = result.participants.find(p => p.id === 'participant-1');
      expect(previousSpeaker?.status).toBe(ParticipantStatus.FINISHED);
      
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
      
      // Should be removed from queue
      expect(result.speakerQueue.length).toBe(0);
    });

    it('should move to next speaker if current speaker is skipped', () => {
      const state = createMockState();
      const result = meetingTimerService.skipParticipant(state, 'participant-1');
      
      // Current speaker should be marked as skipped
      const skippedSpeaker = result.participants.find(p => p.id === 'participant-1');
      expect(skippedSpeaker?.status).toBe(ParticipantStatus.FINISHED);
      
      // Next speaker should be activated
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
          totalDurationMinutes: 2,
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
            donatedTimeSeconds: 0,
            receivedTimeSeconds: 0,
            status: ParticipantStatus.ACTIVE,
            hasSpeakerRole: true
          },
          {
            id: 'participant-2',
            name: 'Bob',
            included: true,
            allocatedTimeSeconds: 120,
            remainingTimeSeconds: 120,
            usedTimeSeconds: 0,
            donatedTimeSeconds: 0,
            receivedTimeSeconds: 0,
            status: ParticipantStatus.PENDING,
            hasSpeakerRole: false
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
          totalDurationMinutes: 2,
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

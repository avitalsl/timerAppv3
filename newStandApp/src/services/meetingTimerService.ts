import { ParticipantStatus } from '../contexts/MeetingContext';
import type { Participant, MeetingState } from '../contexts/MeetingContext';

/**
 * Determines if a participant can donate time
 * Rule: A participant can donate if they have more than 10 seconds remaining
 */
export function canDonateTime(participant: Participant): { canDonate: boolean; maxAmount: number } {
  // Participant can donate if they have more than 10 seconds remaining
  // and they are not the current active speaker
  const canDonate = participant.remainingTimeSeconds > 10 && participant.status !== ParticipantStatus.ACTIVE;
  return { canDonate, maxAmount: canDonate ? 10 : 0 };
}

/**
 * Process a time donation from a participant to the current speaker
 * Returns the updated state with the donation applied or the original state
 * with an error if the donation could not be processed
 * 
 * Note: Donation is always a constant (10 seconds) and automatically directed
 * to the current speaker (no recipient selection).
 */
export function donateTime(
  state: MeetingState,
  fromParticipantId: string
): MeetingState {
  // Fixed donation amount
  const DONATION_AMOUNT = 10; // 10 seconds
  
  // Find the donor participant
  const donor = state.participants.find(p => p.id === fromParticipantId);
  
  // Validate donor exists
  if (!donor) {
    console.error("Donor participant not found");
    return state;
  }
  
  // Check if there is a current speaker
  if (!state.currentSpeakerId) {
    console.error("No active speaker to receive donation");
    return state;
  }
  
  // Find the recipient (current speaker)
  const recipient = state.participants.find(p => p.id === state.currentSpeakerId);
  
  // Validate recipient exists
  if (!recipient) {
    console.error("Recipient participant not found");
    return state;
  }
  
  // Check if donor can donate
  const { canDonate } = canDonateTime(donor);
  if (!canDonate) {
    console.error("Participant cannot donate time at this moment");
    return state;
  }
  
  // Find the indices of both participants
  const donorIndex = state.participants.findIndex(p => p.id === donor.id);
  const recipientIndex = state.participants.findIndex(p => p.id === recipient.id);
  
  // Create copies of the participants array and the specific participants
  const updatedParticipants = [...state.participants];
  const updatedDonor = {
    ...donor,
    remainingTimeSeconds: donor.remainingTimeSeconds - DONATION_AMOUNT
  };
  
  const updatedRecipient = {
    ...recipient,
    remainingTimeSeconds: recipient.remainingTimeSeconds + DONATION_AMOUNT
  };
  
  // Update the participants in the array
  updatedParticipants[donorIndex] = updatedDonor;
  updatedParticipants[recipientIndex] = updatedRecipient;
  
  // Return updated state
  return {
    ...state,
    participants: updatedParticipants,
    currentTimeSeconds: state.currentTimeSeconds + DONATION_AMOUNT // Update the current timer as well
  };
}

/**
 * Finds the next participant who should speak and advances to them
 * Returns a new state object with updated participant statuses
 */
export function moveToNextParticipant(state: MeetingState): MeetingState {
  const newState = { ...state };
  
  // If there's a current speaker, mark them as finished
  if (state.currentSpeakerId) {
    const currentSpeakerIndex = state.participants.findIndex(p => p.id === state.currentSpeakerId);
    if (currentSpeakerIndex !== -1) {
      // Create a new participants array to avoid mutating state directly
      const updatedParticipants = [...state.participants];
      updatedParticipants[currentSpeakerIndex] = {
        ...updatedParticipants[currentSpeakerIndex],
        status: ParticipantStatus.FINISHED,
        hasSpeakerRole: false
      };
      newState.participants = updatedParticipants;
    }
  }
  
  // Find the next pending participant
  const nextPendingParticipant = state.participants.find(p => p.status === ParticipantStatus.PENDING);
  
  // If there's no next pending participant, the meeting is done
  if (!nextPendingParticipant) {
    return {
      ...newState,
      currentSpeakerId: null,
      meetingStatus: 'Finished',
      timerStatus: 'finished'
    };
  }
  
  // Update the next participant to active
  const updatedParticipants = newState.participants.map(p => 
    p.id === nextPendingParticipant.id 
      ? { ...p, status: ParticipantStatus.ACTIVE, hasSpeakerRole: true } 
      : p
  );
  
  // Remove the participant from the speaker queue but keep others
  const updatedQueue = newState.speakerQueue.filter(id => id !== nextPendingParticipant.id);
  
  return {
    ...newState,
    participants: updatedParticipants,
    currentSpeakerId: nextPendingParticipant.id,
    timerStatus: 'running',
    currentTimeSeconds: nextPendingParticipant.remainingTimeSeconds,
    speakerQueue: updatedQueue
  };
}

/**
 * Mark a participant as skipped and adjust the speaker queue
 */
export function skipParticipant(state: MeetingState, participantId: string): MeetingState {
  const participantIndex = state.participants.findIndex(p => p.id === participantId);
  
  // If participant not found, return the original state
  if (participantIndex === -1) return state;
  
  // Create a copy of participants array to avoid direct mutation
  const updatedParticipants = [...state.participants];
  
  // Update the participant status to skipped
  updatedParticipants[participantIndex] = {
    ...updatedParticipants[participantIndex],
    status: ParticipantStatus.SKIPPED,
    hasSpeakerRole: false
  };

  // If this was the current speaker, move to the next one
  const wasCurrentSpeaker = state.currentSpeakerId === participantId;
  
  // Create updated state
  const updatedState = {
    ...state,
    participants: updatedParticipants,
  };

  // If we skipped the current speaker, move to the next participant
  if (wasCurrentSpeaker) {
    // When skipping the current speaker, we need to mark them as FINISHED
    // to maintain consistency with the moveToNextParticipant function's behavior
    const updatedParticipantsWithFinished = updatedParticipants.map(p => 
      p.id === participantId 
        ? { ...p, status: ParticipantStatus.FINISHED, hasSpeakerRole: false } 
        : p
    );
    
    return moveToNextParticipant({
      ...updatedState,
      participants: updatedParticipantsWithFinished
    });
  }
  
  // Otherwise, just remove from queue if present
  const updatedQueue = state.speakerQueue.filter(id => id !== participantId);
  
  return {
    ...updatedState,
    speakerQueue: updatedQueue
  };
}

/**
 * Process time tick for the current speaker or fixed-mode timer
 * Updates the speaker's remaining time and used time or just decrements the fixed timer
 * Returns updated state and handles automatic transitions
 */
export function processTick(state: MeetingState, elapsedSeconds: number = 1): MeetingState {
  // If meeting isn't active or timer isn't running, return original state
  if (!state.isMeetingActive || state.timerStatus !== 'running') {
    return state;
  }
  
  // Handle fixed-mode timer (no current speaker)
  if (state.timerConfig?.mode === 'fixed' || !state.currentSpeakerId) {
    // Simply decrement the timer
    const newTimeSeconds = Math.max(0, state.currentTimeSeconds - elapsedSeconds);
    
    // Return updated state with new time
    return {
      ...state,
      currentTimeSeconds: newTimeSeconds,
      // If time is up, set timer status to finished
      timerStatus: newTimeSeconds <= 0 ? 'finished' : state.timerStatus
    };
  }
  
  // Handle per-participant mode (with current speaker)
  const currentSpeakerIndex = state.participants.findIndex(p => p.id === state.currentSpeakerId);
  
  // If speaker not found, return original state
  if (currentSpeakerIndex === -1) {
    return state;
  }
  
  const currentSpeaker = state.participants[currentSpeakerIndex];
  
  // Calculate new remaining time
  const newRemainingTime = Math.max(0, currentSpeaker.remainingTimeSeconds - elapsedSeconds);
  const newUsedTime = currentSpeaker.usedTimeSeconds + elapsedSeconds;
  
  // Update the current speaker's times
  const updatedParticipants = [...state.participants];
  updatedParticipants[currentSpeakerIndex] = {
    ...currentSpeaker,
    remainingTimeSeconds: newRemainingTime,
    usedTimeSeconds: newUsedTime
  };
  
  const updatedState = {
    ...state,
    participants: updatedParticipants,
    currentTimeSeconds: newRemainingTime
  };
  
  // If time is up for the current speaker, move to the next one
  if (newRemainingTime <= 0) {
    console.log('[processTick] Current speaker time is up, moving to next participant', {
      currentSpeakerId: state.currentSpeakerId,
      remainingTime: newRemainingTime
    });
    return moveToNextParticipant(updatedState);
  }
  
  return updatedState;
}

// Export all functions as part of a service object
export const meetingTimerService = {
  canDonateTime,
  donateTime,
  moveToNextParticipant,
  skipParticipant,
  processTick
};

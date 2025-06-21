import { ParticipantStatus } from '../contexts/MeetingContext';
import type { Participant, TimeDonation, MeetingState } from '../contexts/MeetingContext';

/**
 * Pure function to calculate the total available time for a participant
 * This includes their initially allocated time plus any received donations
 * minus any time they have donated.
 */
export function calculateTotalAvailableTime(participant: Participant): number {
  return participant.allocatedTimeSeconds + participant.receivedTimeSeconds - participant.donatedTimeSeconds;
}

/**
 * Pure function to calculate the current remaining time for a participant
 * This is their total available time minus the time they've already used.
 */
export function calculateRemainingTime(participant: Participant): number {
  return calculateTotalAvailableTime(participant) - participant.usedTimeSeconds;
}

/**
 * Determines if a participant can donate time and how much
 * Rules:
 * - PENDING participants can donate up to 10% of their allocated time
 * - FINISHED or SKIPPED participants can donate all their remaining time
 * - ACTIVE participants cannot donate time
 */
export function canDonateTime(participant: Participant): { canDonate: boolean; maxAmount: number } {
  if (participant.status === ParticipantStatus.PENDING) {
    return { canDonate: true, maxAmount: Math.floor(participant.allocatedTimeSeconds * 0.1) };
  }
  
  if (participant.status === ParticipantStatus.FINISHED || participant.status === ParticipantStatus.SKIPPED) {
    return { canDonate: true, maxAmount: calculateRemainingTime(participant) };
  }
  
  return { canDonate: false, maxAmount: 0 };
}

/**
 * Process a time donation between participants
 * Returns the updated state with the donation applied or the original state
 * with an error if the donation could not be processed
 */
export function donateTime(
  state: MeetingState,
  fromParticipantId: string,
  toParticipantId: string,
  amountSeconds: number
): MeetingState {
  // Find the participants
  const donor = state.participants.find(p => p.id === fromParticipantId);
  const recipient = state.participants.find(p => p.id === toParticipantId);
  
  // Validate participants exist
  if (!donor) {
    console.error("Donor participant not found");
    return state;
  }
  if (!recipient) {
    console.error("Recipient participant not found");
    return state;
  }

  // Check if donor can donate
  const { canDonate, maxAmount } = canDonateTime(donor);
  if (!canDonate) {
    console.error("Participant cannot donate time at this moment");
    return state;
  }
  
  // Validate donation amount
  if (amountSeconds <= 0) {
    console.error("Donation amount must be greater than 0");
    return state;
  }
  
  if (amountSeconds > maxAmount) {
    console.error(`Maximum donation allowed is ${maxAmount} seconds`);
    return state;
  }
  
  // Create the donation object
  const donation: TimeDonation = {
    id: Math.random().toString(36).substr(2, 9), // Simple random ID generation
    fromParticipantId: donor.id,
    toParticipantId: recipient.id,
    amountSeconds,
    timestamp: Date.now(),
  };
  
  // Find the indices of both participants
  const donorIndex = state.participants.findIndex(p => p.id === donor.id);
  const recipientIndex = state.participants.findIndex(p => p.id === recipient.id);
  
  // Create copies of the participants array and the specific participants
  const updatedParticipants = [...state.participants];
  const updatedDonor = {
    ...donor,
    donatedTimeSeconds: donor.donatedTimeSeconds + amountSeconds
  };
  
  const updatedRecipient = {
    ...recipient,
    receivedTimeSeconds: recipient.receivedTimeSeconds + amountSeconds,
    remainingTimeSeconds: recipient.remainingTimeSeconds + amountSeconds
  };
  
  // Update the participants in the array
  updatedParticipants[donorIndex] = updatedDonor;
  updatedParticipants[recipientIndex] = updatedRecipient;
  
  // Return updated state with the donation recorded
  return {
    ...state,
    participants: updatedParticipants,
    timeDonations: [...state.timeDonations, donation]
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
  
  return {
    ...newState,
    participants: updatedParticipants,
    currentSpeakerId: nextPendingParticipant.id,
    timerStatus: 'running',
    currentTimeSeconds: calculateTotalAvailableTime(nextPendingParticipant)
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
    return moveToNextParticipant(updatedState);
  }
  
  // Otherwise, just remove from queue if present
  const updatedQueue = state.speakerQueue.filter(id => id !== participantId);
  
  return {
    ...updatedState,
    speakerQueue: updatedQueue
  };
}

/**
 * Process time tick for the current speaker
 * Updates the speaker's remaining time and used time
 * Returns updated state and handles automatic transitions
 */
export function processTick(state: MeetingState, elapsedSeconds: number = 1): MeetingState {
  // If meeting isn't active or there's no current speaker, return original state
  if (!state.isMeetingActive || !state.currentSpeakerId || state.timerStatus !== 'running') {
    return state;
  }
  
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
    return moveToNextParticipant(updatedState);
  }
  
  return updatedState;
}

// Export all functions as part of a service object
export const meetingTimerService = {
  calculateTotalAvailableTime,
  calculateRemainingTime,
  canDonateTime,
  donateTime,
  moveToNextParticipant,
  skipParticipant,
  processTick
};

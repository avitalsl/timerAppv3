import { Participant, ParticipantStatus, TimeDonation } from '../contexts/MeetingContext';

/**
 * Calculates the total remaining time for a participant, including base time and any received donations
 * @param participant The participant to calculate remaining time for
 * @returns The total remaining time in seconds
 */
export const calculateRemainingTime = (participant: Participant): number => {
  if (!participant.included) {
    return 0;
  }
  
  // Sum up all received donations
  const donatedTimeTotal = participant.receivedDonations.reduce(
    (total, donation) => total + donation.amountSeconds, 
    0
  );
  
  return participant.remainingTimeSeconds + donatedTimeTotal;
};

/**
 * Determines if a participant can donate time based on their status and remaining time
 * @param donor The participant who wants to donate time
 * @param maxDonationPercent Maximum percentage of allocated time that can be donated (0-1)
 * @returns Whether the participant can donate time
 */
export const canDonateTime = (
  donor: Participant,
  maxDonationPercent = 0.1
): boolean => {
  if (!donor.included) {
    return false;
  }

  // Participants who haven't spoken yet can donate up to maxDonationPercent of their time
  if (donor.status === ParticipantStatus.PENDING) {
    // Calculate the max amount they can donate
    const maxDonationAmount = donor.allocatedTimeSeconds * maxDonationPercent;
    // Check if they have enough time remaining
    return donor.remainingTimeSeconds >= maxDonationAmount;
  }
  
  // Participants who have finished can donate any remaining time
  if (donor.status === ParticipantStatus.FINISHED) {
    return donor.remainingTimeSeconds > 0;
  }
  
  // Participants who were skipped can donate any remaining time
  if (donor.status === ParticipantStatus.SKIPPED) {
    return donor.remainingTimeSeconds > 0;
  }
  
  // Active participants can't donate
  return false;
};

/**
 * Donates time from one participant to another
 * @param donor The participant donating time
 * @param recipient The participant receiving time
 * @param timeSeconds Amount of time to donate in seconds
 * @param maxDonationPercent Maximum percentage of allocated time that can be donated (0-1)
 * @returns Object with updated donor, recipient, and TimeDonation object or error message
 */
export const donateTime = (
  donor: Participant,
  recipient: Participant,
  timeSeconds: number,
  maxDonationPercent = 0.1
): { 
  donor: Participant; 
  recipient: Participant; 
  donation?: TimeDonation; 
  error?: string; 
} => {
  // Validate donor can donate time
  if (!canDonateTime(donor, maxDonationPercent)) {
    return { donor, recipient, error: "Donor cannot donate time" };
  }

  // Validate donation amount
  let maxDonationAmount = donor.remainingTimeSeconds;
  if (donor.status === ParticipantStatus.PENDING) {
    maxDonationAmount = donor.allocatedTimeSeconds * maxDonationPercent;
  }

  if (timeSeconds <= 0) {
    return { donor, recipient, error: "Must donate a positive amount of time" };
  }

  if (timeSeconds > maxDonationAmount) {
    return { donor, recipient, error: `Cannot donate more than ${maxDonationAmount} seconds` };
  }
  
  // Create donation record
  const donation: TimeDonation = {
    donorId: donor.id,
    recipientId: recipient.id,
    amountSeconds: timeSeconds,
    timestamp: Date.now()
  };
  
  // Update donor's remaining time
  const updatedDonor: Participant = {
    ...donor,
    remainingTimeSeconds: donor.remainingTimeSeconds - timeSeconds
  };
  
  // Add donation to recipient's received donations
  const updatedRecipient: Participant = {
    ...recipient,
    receivedDonations: [...recipient.receivedDonations, donation]
  };
  
  return { donor: updatedDonor, recipient: updatedRecipient, donation };
};

/**
 * Moves to the next participant in the meeting
 * @param participants List of all participants
 * @param currentSpeakerId ID of the current speaker
 * @returns Object with the next speaker and updated participant list
 */
export const moveToNextParticipant = (
  participants: Participant[],
  currentSpeakerId: string | null
): {
  nextSpeakerId: string | null;
  updatedParticipants: Participant[];
} => {
  if (!participants.length) {
    return { nextSpeakerId: null, updatedParticipants: [] };
  }
  
  // If no current speaker, find the first eligible participant
  if (!currentSpeakerId) {
    const nextSpeaker = participants.find(p => 
      p.included && p.status === ParticipantStatus.PENDING
    );
    
    if (!nextSpeaker) {
      return { nextSpeakerId: null, updatedParticipants: participants };
    }
    
    // Mark this participant as active
    const updatedParticipants = participants.map(p => 
      p.id === nextSpeaker.id
        ? { ...p, status: ParticipantStatus.ACTIVE }
        : p
    );
    
    return {
      nextSpeakerId: nextSpeaker.id,
      updatedParticipants
    };
  }
  
  // Mark current speaker as finished
  const updatedParticipants = participants.map(p => 
    p.id === currentSpeakerId
      ? { ...p, status: ParticipantStatus.FINISHED }
      : p
  );
  
  // Find the next pending participant
  const currentIndex = participants.findIndex(p => p.id === currentSpeakerId);
  const eligibleParticipants = updatedParticipants.filter(
    p => p.included && p.status === ParticipantStatus.PENDING
  );
  
  if (!eligibleParticipants.length) {
    return { nextSpeakerId: null, updatedParticipants };
  }
  
  // Find the next pending participant after the current one
  const remainingParticipants = updatedParticipants.slice(currentIndex + 1);
  const nextSpeaker = remainingParticipants.find(p => 
    p.included && p.status === ParticipantStatus.PENDING
  ) || eligibleParticipants[0];
  
  // Mark this participant as active
  const finalParticipants = updatedParticipants.map(p => 
    p.id === nextSpeaker.id
      ? { ...p, status: ParticipantStatus.ACTIVE }
      : p
  );
  
  return {
    nextSpeakerId: nextSpeaker.id,
    updatedParticipants: finalParticipants
  };
};

/**
 * Skips the current participant and saves their remaining time
 * @param participants List of all participants
 * @param currentSpeakerId ID of the current speaker
 * @returns Object with the next speaker and updated participant list
 */
export const skipParticipant = (
  participants: Participant[],
  currentSpeakerId: string | null
): {
  nextSpeakerId: string | null;
  updatedParticipants: Participant[];
} => {
  if (!currentSpeakerId) {
    return moveToNextParticipant(participants, null);
  }
  
  // Mark current speaker as skipped (preserving their remaining time)
  const updatedParticipants = participants.map(p => 
    p.id === currentSpeakerId
      ? { ...p, status: ParticipantStatus.SKIPPED }
      : p
  );
  
  // Continue with the normal next participant logic
  return moveToNextParticipant(updatedParticipants, currentSpeakerId);
};

/**
 * Customizes a participant's allocated and remaining time
 * @param participant The participant to customize time for
 * @param newTimeSeconds The new time in seconds
 * @returns Updated participant with new time values
 */
export const customizeParticipantTime = (
  participant: Participant,
  newTimeSeconds: number
): Participant => {
  if (newTimeSeconds <= 0) {
    return participant; // No change for invalid time values
  }
  
  // Only update time if the participant hasn't started speaking yet
  if (participant.status === ParticipantStatus.PENDING) {
    return {
      ...participant,
      allocatedTimeSeconds: newTimeSeconds,
      remainingTimeSeconds: newTimeSeconds
    };
  }
  
  // For active participants, only update remaining time
  if (participant.status === ParticipantStatus.ACTIVE) {
    return {
      ...participant,
      remainingTimeSeconds: newTimeSeconds
    };
  }
  
  // No changes for finished participants
  return participant;
};

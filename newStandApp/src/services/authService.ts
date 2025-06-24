import type { Participant } from '../contexts/MeetingContext';
import type { AppUser } from '../types/userTypes';

/**
 * Service for handling authentication-related functionality
 */
export const authService = {
  /**
   * Matches a user by email to a participant in the list
   * @param email The email to match
   * @param participants The list of participants to search in
   * @returns The matched participant or null if no match is found
   */
  matchParticipantByEmail(email: string, participants: Participant[]): Participant | null {
    if (!email) return null;
    
    // Find a participant with a matching email
    return participants.find(participant => 
      participant.email && participant.email.toLowerCase() === email.toLowerCase()
    ) || null;
  },

  /**
   * Updates a participant to be interactive based on user information
   * @param participant The participant to update
   * @param user The authenticated user information
   * @returns The updated participant
   */
  updateParticipantFromUser(participant: Participant, user: AppUser): Participant {
    return {
      ...participant,
      type: 'interactive',
      email: user.email || participant.email,
      userId: user.id
    };
  },

  /**
   * Creates a new interactive participant from user information
   * @param user The authenticated user information
   * @returns A new participant object
   */
  createParticipantFromUser(user: AppUser): Participant {
    return {
      id: `participant-${Date.now()}`,
      name: user.name,
      included: true,
      allocatedTimeSeconds: 120, // Default allocation
      remainingTimeSeconds: 120,
      usedTimeSeconds: 0,
      status: 'PENDING',
      hasSpeakerRole: false,
      type: 'interactive',
      email: user.email,
      userId: user.id
    };
  }
};

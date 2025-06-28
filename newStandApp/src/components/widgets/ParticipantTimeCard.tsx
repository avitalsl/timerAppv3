import React, { useEffect } from 'react';
import { User, Gift, SkipForward, Lock, BookOpen } from 'lucide-react'; 
import { type Participant, ParticipantStatus } from '../../contexts/MeetingContext';
import { meetingTimerService } from '../../services/meetingTimerService';
import { useUserContext } from '../../contexts/UserContext';
import { useMeeting } from '../../contexts/MeetingContext';

interface ParticipantTimeCardProps {
  participant: Participant;
  isCurrentSpeaker: boolean;
  onDonateClick: () => void;
  onSkipClick?: (participantId: string) => void;
  /**
   * Optional override for current user ID - used for testing
   */
  currentUserId?: string;
}

/**
 * A card component that displays a participant's information with time allocation
 * and donation controls
 */
const ParticipantTimeCard: React.FC<ParticipantTimeCardProps> = ({
  participant,
  isCurrentSpeaker,
  onDonateClick,
  onSkipClick,
  currentUserId
}) => {
  // Get user context to check permissions
  const { isInteractiveUser, currentUser } = useUserContext();
  const { state } = useMeeting();
  
  // Determine if the current user can interact with controls
  const canInteract = isInteractiveUser(currentUserId);
  
  // Check if this card represents the current user
  const isCurrentUserCard = currentUser?.id === participant.id;
  // Check if donation is possible for this participant
  const { canDonate } = meetingTimerService.canDonateTime(participant);
  
  // Determine if there is an active speaker (for donation button visibility)
  const hasActiveSpeaker = !!state.currentSpeakerId;
  // Check if this participant is the active speaker
  const isActiveSpeaker = participant.id === state.currentSpeakerId;
  
  // Show donate button only for interactive users on their own card
  // We'll show it disabled if they can't donate (not enough time)
  const showDonateButton = isCurrentUserCard && participant.type === 'interactive' && hasActiveSpeaker && !isActiveSpeaker;

  // Determine if this is a Storytime participant
  const isStorytime = participant.type === 'storytime';
  
  // Get storyteller name from meeting state
  const storytellerName = state.kickoffSettings?.storytellerName || 'Storyteller';

  // Log participant statuses at different stages of the meeting
  
  // Format seconds to display as mm:ss
  const formatTime = (seconds: number): string => {
    // Add defensive handling for undefined, null, or NaN values
    if (seconds === undefined || seconds === null || isNaN(seconds)) {
      seconds = 0;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Determine card styling based on participant status and type
  let cardClasses = "p-3 rounded-lg border transition-all duration-300 ease-in-out";
  let statusColor = "bg-gray-100";
  
  // Special styling for Storytime
  if (isStorytime) {
    cardClasses += " border-indigo-300 bg-indigo-50";
  } else {
    switch(participant.status) {
      case ParticipantStatus.ACTIVE:
        cardClasses += " border-primary-dark";
        statusColor = "bg-green-500";
        break;
      case ParticipantStatus.FINISHED:
      case ParticipantStatus.SKIPPED:
        cardClasses += " border-gray-300 bg-gray-50";
        statusColor = "bg-blue-500";
        break;
      default: // PENDING
        cardClasses += " border-gray-200";
        statusColor = "bg-gray-300";
        break;
    }
  }
  
  // Add highlighting for current speaker or explicitly reset ring styling when not the current speaker
  if (isCurrentSpeaker) {
    cardClasses += " ring-2 ring-primary-dark";
  } else {
    cardClasses += " ring-0 shadow-none";
  }

  return (
    <div className={cardClasses} data-testid={`participant-card-${participant.id}`}>
      {/* Header with name and status indicator */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {isStorytime ? (
            <BookOpen className="w-4 h-4 mr-2 text-indigo-700" />
          ) : (
            <User className="w-4 h-4 mr-2 text-gray-700" />
          )}
          <h4 className={`font-medium ${isStorytime ? 'text-indigo-800' : 'text-gray-800'}`}>
            {participant.name}
            {isStorytime && <span className="ml-2 text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">Storytime</span>}
          </h4>
        </div>
        {!isStorytime && <div className={`w-3 h-3 rounded-full ${statusColor}`} title={participant.status}></div>}
      </div>
      
      {/* Storytime description */}
      {isStorytime && (
        <div className="text-xs text-indigo-700 mt-1 mb-2" data-component-name="ParticipantTimeCard">
          {`Story by ${storytellerName}`}
        </div>
      )}
      
      {/* Action buttons - only shown to interactive users and not for Storytime */}
      <div className="flex justify-between mt-2">
        {canInteract && !isStorytime ? (
          <>
            {showDonateButton && (
              <button 
                className={`px-2 py-1 rounded text-xs flex items-center ${
                  canDonate 
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                onClick={canDonate ? onDonateClick : undefined}
                title="Give 10 seconds to the speaker"
                disabled={!canDonate}
                data-testid={`donate-btn-${participant.id}`}
              >
                <Gift className="w-3 h-3 mr-1" />
                Donate 10s
              </button>
            )}
            
            {participant.status === ParticipantStatus.PENDING && onSkipClick && (
              <button 
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center hover:bg-gray-200"
                onClick={() => onSkipClick(participant.id)}
                data-testid={`skip-btn-${participant.id}`}
              >
                <SkipForward className="w-3 h-3 mr-1" />
                Skip
              </button>
            )}
          </>
        ) : !isStorytime ? (
          <div className="flex items-center text-xs text-gray-500">
            <Lock className="w-3 h-3 mr-1" />
            <span>View only</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ParticipantTimeCard;

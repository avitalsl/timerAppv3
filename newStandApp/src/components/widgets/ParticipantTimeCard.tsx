import React from 'react';
import { User, Gift, SkipForward, Lock } from 'lucide-react'; // Icons for the card
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
  
  // Determine card styling based on participant status
  let cardClasses = "p-3 rounded-lg border transition-all duration-300 ease-in-out";
  let statusColor = "bg-gray-100";
  
  switch(participant.status) {
    case ParticipantStatus.ACTIVE:
      cardClasses += " border-primary-dark bg-primary-light";
      statusColor = "bg-green-500";
      break;
    case ParticipantStatus.FINISHED:
      cardClasses += " border-gray-300 bg-gray-50";
      statusColor = "bg-blue-500";
      break;
    case ParticipantStatus.SKIPPED:
      cardClasses += " border-gray-300 bg-gray-50 opacity-70";
      statusColor = "bg-yellow-500";
      break;
    default: // PENDING
      cardClasses += " border-gray-200";
      statusColor = "bg-gray-300";
      break;
  }
  
  // Add highlighting for current speaker
  if (isCurrentSpeaker) {
    cardClasses += " ring-2 ring-primary-dark";
  }

  return (
    <div className={cardClasses} data-testid={`participant-card-${participant.id}`}>
      {/* Header with name and status indicator */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-gray-700" />
          <h4 className="font-medium text-gray-800">{participant.name}</h4>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColor}`} title={participant.status}></div>
      </div>
      
      {/* Time information */}
      <div className="flex justify-between text-xs mb-3">
        <div className="flex flex-col">
          <span className="text-gray-500">Time</span>
          <span className="font-medium">{formatTime(participant.remainingTimeSeconds)}</span>
        </div>
      </div>
      
      {/* Action buttons - only shown to interactive users */}
      <div className="flex justify-between mt-2">
        {canInteract ? (
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
        ) : (
          <div className="flex items-center text-xs text-gray-500">
            <Lock className="w-3 h-3 mr-1" />
            <span>View only</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantTimeCard;

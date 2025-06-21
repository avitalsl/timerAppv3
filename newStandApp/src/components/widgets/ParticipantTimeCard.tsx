import React from 'react';
import { User, Gift, SkipForward } from 'lucide-react'; // Icons for the card
import { type Participant, ParticipantStatus } from '../../contexts/MeetingContext';
import { meetingTimerService } from '../../services/meetingTimerService';

interface ParticipantTimeCardProps {
  participant: Participant;
  isCurrentSpeaker: boolean;
  onDonateClick: (participantId: string) => void;
  onSkipClick?: (participantId: string) => void;
}

/**
 * A card component that displays a participant's information with time allocation
 * and donation controls
 */
const ParticipantTimeCard: React.FC<ParticipantTimeCardProps> = ({
  participant,
  isCurrentSpeaker,
  onDonateClick,
  onSkipClick
}) => {
  // Check if donation is possible for this participant
  const { canDonate, maxAmount } = meetingTimerService.canDonateTime(participant);
  
  // Format seconds to display as mm:ss
  const formatTime = (seconds: number): string => {
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
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex flex-col">
          <span className="text-gray-500">Allocated</span>
          <span className="font-medium">{formatTime(participant.allocatedTimeSeconds)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500">Remaining</span>
          <span className="font-medium">{formatTime(participant.remainingTimeSeconds)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500">Used</span>
          <span className="font-medium">{formatTime(participant.usedTimeSeconds)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500">Net Donated</span>
          <span className={`font-medium ${participant.donatedTimeSeconds > participant.receivedTimeSeconds ? 'text-amber-600' : 'text-emerald-600'}`}>
            {participant.donatedTimeSeconds > participant.receivedTimeSeconds ? '-' : '+'}
            {formatTime(Math.abs(participant.donatedTimeSeconds - participant.receivedTimeSeconds))}
          </span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between mt-2">
        <button 
          className={`px-2 py-1 rounded text-xs flex items-center ${canDonate ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          onClick={() => canDonate && onDonateClick(participant.id)}
          disabled={!canDonate}
          title={canDonate ? `Can donate up to ${maxAmount} seconds` : "Cannot donate time"}
          data-testid={`donate-btn-${participant.id}`}
        >
          <Gift className="w-3 h-3 mr-1" />
          Donate
        </button>
        
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
      </div>
    </div>
  );
};

export default ParticipantTimeCard;

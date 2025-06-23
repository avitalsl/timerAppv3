import React, { useState } from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import { User } from 'lucide-react'; // User icon for participants
import ParticipantTimeCard from './ParticipantTimeCard';
import TimeDonationModal from './TimeDonationModal';
import { meetingTimerService } from '../../services/meetingTimerService';

const ParticipantListWidget: React.FC = () => {
  const { state, dispatch } = useMeeting();
  const {
    participants,
    currentParticipantIndex,
    participantListVisibilityMode,
    timerConfig,
    isMeetingActive // Added to ensure we only render meaningfully during a meeting
  } = state;

  // State for donation modal
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donorId, setDonorId] = useState<string>('');
  const [recipientId, setRecipientId] = useState<string>('');
  const [maxDonationSeconds, setMaxDonationSeconds] = useState(0);

  // Early exit or placeholder if meeting is not active or no participants
  if (!isMeetingActive) {
    return (
      <div className="p-4 bg-white rounded-lg shadow h-full flex flex-col items-center justify-center text-gray-400" data-testid="widget-participants-inactive">
        <User className="w-10 h-10 mb-2" />
        <p>Participant list will appear here when the meeting starts.</p>
      </div>
    );
  }
  
  if (!participants || participants.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow h-full flex flex-col items-center justify-center text-gray-500" data-testid="widget-participants-empty">
        <User className="w-10 h-10 mb-2" />
        <p>No participants in this meeting.</p>
      </div>
    );
  }

  // Handle donation button click
  const handleDonateClick = (participantId: string) => {
    // Find the participant who will receive the donation
    const recipient = participants.find(p => p.id === participantId);
    if (!recipient) return;

    // Find the current speaker (donor)
    const currentSpeakerIndex = currentParticipantIndex !== null ? currentParticipantIndex : -1;
    if (currentSpeakerIndex === -1) return;
    
    const donor = participants[currentSpeakerIndex];
    
    // Check if donation is possible and get max amount
    const { canDonate, maxAmount } = meetingTimerService.canDonateTime(donor);
    if (!canDonate || maxAmount <= 0) return;
    
    // Set state for modal
    setDonorId(donor.id);
    setRecipientId(participantId);
    setMaxDonationSeconds(maxAmount);
    setIsDonationModalOpen(true);
  };

  // Handle skip button click
  const handleSkipClick = (participantId: string) => {
    dispatch({
      type: 'SKIP_PARTICIPANT',
      payload: { participantId }
    });
  };

  // Handle donation submission
  const handleDonationSubmit = (donorId: string, recipientId: string, seconds: number) => {
    dispatch({
      type: 'DONATE_TIME',
      payload: {
        fromParticipantId: donorId,
        toParticipantId: recipientId,
        amountSeconds: seconds
      }
    });
  };

  // Determine if we should apply focus styling (blurring non-speakers)
  const shouldFocusSpeaker = participantListVisibilityMode === 'focus_speaker';

  return (
    <div className="p-4 bg-white rounded-lg shadow h-full flex flex-col" data-testid="widget-participants">
      <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Participants</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto flex-grow" data-testid="participant-list-ul">
        {participants.map((participant, index) => {
          const isCurrentSpeaker = index === currentParticipantIndex;
          
          // Apply blur to non-current speakers if focus mode is enabled
          const cardStyle = shouldFocusSpeaker && !isCurrentSpeaker 
            ? { filter: 'blur(2px)', opacity: 0.6 } 
            : {};

          return (
            <div key={`${participant.id}-${index}`} style={cardStyle}>
              <ParticipantTimeCard
                participant={participant}
                isCurrentSpeaker={isCurrentSpeaker}
                onDonateClick={handleDonateClick}
                onSkipClick={handleSkipClick}
              />
            </div>
          );
        })}
      </div>
      
      {/* Time Donation Modal */}
      <TimeDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        donorId={donorId}
        recipientId={recipientId}
        maxDonationSeconds={maxDonationSeconds}
        onDonationSubmit={handleDonationSubmit}
      />
    </div>
  );
};

export default ParticipantListWidget;

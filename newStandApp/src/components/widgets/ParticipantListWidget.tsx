import React from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import { User, BookOpen } from 'lucide-react'; // User icon for participants, BookOpen icon for Storytime
import ParticipantTimeCard from './ParticipantTimeCard';
import { useUserContext } from '../../contexts/UserContext';
import { useTimerAnimation } from '../MeetingScreen';

const ParticipantListWidget: React.FC = () => {
  const { state, dispatch } = useMeeting();
  const { currentUser } = useUserContext();
  const { triggerDonationAnimation } = useTimerAnimation();
  const {
    participants,
    currentSpeakerId,
    participantListVisibilityMode,
    isMeetingActive // Added to ensure we only render meaningfully during a meeting
  } = state;

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

  // Handle donation button click - now simplified to just dispatch the action
  const handleDonateClick = () => {
    if (!currentUser?.id) return;
    
    dispatch({
      type: 'DONATE_TIME',
      payload: {
        fromParticipantId: currentUser.id
      }
    });
    
    // Trigger the donation animation in the TimerWidget
    triggerDonationAnimation();
  };

  // Handle skip button click
  // const handleSkipClick = (participantId: string) => {
  //   dispatch({
  //     type: 'SKIP_PARTICIPANT',
  //     payload: { participantId }
  //   });
  // };

  // Determine if we should apply focus styling (blurring non-speakers)
  const shouldFocusSpeaker = participantListVisibilityMode === 'focus_speaker';

  return (
    <div className="p-4 bg-white rounded-lg shadow h-full flex flex-col" data-testid="widget-participants">
      <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Participants</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto flex-grow" data-testid="participant-list-ul">
        {participants.map((participant, index) => {
          const isCurrentSpeaker = participant.id === currentSpeakerId;
          const isStorytime = participant.type === 'storytime';
          
          // Apply blur to non-current speakers if focus mode is enabled
          // Don't apply blur to Storytime when it's not the current speaker
          const cardStyle = shouldFocusSpeaker && !isCurrentSpeaker && !isStorytime
            ? { filter: 'blur(2px)', opacity: 0.6 } 
            : {};

          return (
            <div key={`${participant.id}-${index}`} style={cardStyle}>
              <ParticipantTimeCard
                participant={participant}
                isCurrentSpeaker={isCurrentSpeaker}
                onDonateClick={handleDonateClick}
                // onSkipClick={handleSkipClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantListWidget;

import React from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import { User } from 'lucide-react'; // User icon for participants

const ParticipantListWidget: React.FC = () => {
  const { state } = useMeeting();
  const {
    participants,
    currentParticipantIndex,
    participantListVisibilityMode,
    timerConfig,
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

  // Determine if we should apply focus styling (blurring non-speakers)
  const shouldFocusSpeaker = participantListVisibilityMode === 'focus_speaker';

  return (
    <div className="p-4 bg-white rounded-lg shadow h-full flex flex-col" data-testid="widget-participants">
      <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Participants</h3>
      <ul className="space-y-2 overflow-y-auto flex-grow" data-testid="participant-list-ul">
        {participants.map((participant, index) => {
          const isCurrentSpeaker = index === currentParticipantIndex;
          
          let itemClasses = "p-2 rounded-md transition-all duration-300 ease-in-out flex items-center text-sm ";

          // Apply highlighting for the current speaker, typically most relevant in per-participant mode
          if (isCurrentSpeaker && timerConfig?.mode === 'per-participant') {
            itemClasses += "bg-primary-light text-primary-dark font-semibold ring-2 ring-primary-medium";
          } else {
            itemClasses += "bg-gray-50 hover:bg-gray-100 text-gray-800";
          }

          // Apply blur to non-current speakers if focus mode is enabled
          if (shouldFocusSpeaker && !isCurrentSpeaker) {
            itemClasses += " filter blur-sm opacity-60";
          }

          return (
            <li
              key={`${participant.name}-${index}`}
              className={itemClasses.trim()}
              data-testid={`participant-item-${index}`}
            >
              <User className={`w-4 h-4 mr-2 flex-shrink-0 ${isCurrentSpeaker && timerConfig?.mode === 'per-participant' ? 'text-primary-dark' : 'text-gray-500'}`} />
              <span className="truncate">{participant.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ParticipantListWidget;

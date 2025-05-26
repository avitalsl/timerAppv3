import React from 'react';
import TimerWidget from '../components/widgets/TimerWidget';
import ParticipantListWidget from '../components/widgets/ParticipantListWidget';
import { useMeeting } from '../contexts/MeetingContext';

const MeetingScreen: React.FC = () => {
  const { state } = useMeeting();
  const { selectedGridComponentIds } = state;

  return (
    <div 
      className="flex flex-col md:flex-row h-full w-full p-4 gap-4"
      data-testid="meeting-screen-container"
    >
      {/* Timer is always visible in the left sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 sticky top-0" data-testid="timer-sidebar">
        <TimerWidget />
      </div>

      {/* Content area for dynamically rendered components */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="meeting-content-grid">
        {/* Participant List Widget - render if selected */}
        {selectedGridComponentIds.includes('participants') && (
          <div className="col-span-1" data-testid="grid-item-participants">
            <ParticipantListWidget />
          </div>
        )}

        {/* Add other conditionally rendered widgets here */}
        
        {/* Message when no additional components are selected */}
        {selectedGridComponentIds.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-40 bg-gray-100 rounded-lg text-gray-500" data-testid="empty-grid-message">
            <p>No additional components selected. Configure your meeting layout in Setup.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingScreen;

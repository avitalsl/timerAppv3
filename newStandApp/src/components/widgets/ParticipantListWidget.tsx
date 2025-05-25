import React from 'react';
import { UsersIcon, PlusIcon } from 'lucide-react';
import type { Participant } from '../../contexts/MeetingContext'; // Import the Participant type

interface ParticipantListWidgetProps {
  participants: Participant[]; // Expect an array of Participant objects
  mode?: "setup" | "meeting";
  onAddParticipantClick?: () => void; // Optional callback for the "Add" button
}

const ParticipantListWidget: React.FC<ParticipantListWidgetProps> = ({
  participants,
  mode = "setup",
  onAddParticipantClick
}) => {
  return (
    <div className="h-full flex flex-col" data-testid="participant-list-widget-container">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <UsersIcon className="h-4 w-4 text-gray-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Participants</h3>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto">
        <div className="flex flex-wrap gap-2 mb-3" data-testid="participant-list-widget-list">
          {participants.map((participant) => (
            <div
              key={participant.name} // Assuming name is unique for key, or use participant.id if available
              className="flex items-center bg-primary-sandLight text-[#1a2a42] px-3 py-1 rounded-full"
              data-testid={`participant-list-widget-item-${participant.name}`}
            >
              <span className="text-sm">{participant.name}</span>
            </div>
          ))}
          {mode === "setup" && onAddParticipantClick && (
            <div 
              className="flex items-center bg-buttonColor text-gray-500 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200"
              onClick={onAddParticipantClick}
              data-testid="participant-list-widget-add-button" // Added data-testid for the button
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">Add</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantListWidget;

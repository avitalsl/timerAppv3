import React from 'react';
import { UsersIcon, PlusIcon } from 'lucide-react';

interface ParticipantListWidgetProps {
  mode?: "setup" | "meeting";
}

const ParticipantListWidget: React.FC<ParticipantListWidgetProps> = ({ mode = "setup" }) => {
  // This would typically fetch from a state or props
  const participants = [
    'John Doe',
    'Jane Smith',
    'Mike Johnson',
    'Sarah Williams'
  ];

  return (
    <div className="h-full flex flex-col" data-testid="layout-component-participants">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <UsersIcon className="h-4 w-4 text-gray-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Participants</h3>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto">
        <div className="flex flex-wrap gap-2 mb-3">
          {participants.map((name, index) => (
            <div
              key={index}
              className="flex items-center bg-primary-sandLight text-[#1a2a42] px-3 py-1 rounded-full"
            >
              <span className="text-sm">{name}</span>
            </div>
          ))}
          <div className="flex items-center bg-buttonColor text-gray-500 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200">
            <PlusIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">Add</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantListWidget;

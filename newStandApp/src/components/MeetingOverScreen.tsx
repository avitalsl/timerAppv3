import React from 'react';
import { useMeeting } from '../contexts/MeetingContext';

/**
 * Component displayed when the meeting timer has finished.
 * This is a placeholder component that will be shown when the meeting is over.
 */
const MeetingOverScreen: React.FC = () => {
  const { state } = useMeeting();
  
  return (
    <div 
      className="flex flex-col items-center justify-center h-full w-full bg-white p-8 rounded-lg shadow-lg"
      data-testid="meeting-over-screen"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary-dark mb-4">Meeting Completed</h1>
        <div className="w-24 h-24 rounded-full bg-primary-buttonColor flex items-center justify-center mx-auto mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        <p className="text-xl text-gray-600 mb-6">
          The meeting time has ended. Thank you for participating!
        </p>
        <div className="space-y-4">
          {/* Placeholder for future functionality */}
          <p className="text-sm text-gray-500">
            Meeting summary and actions will appear here in future versions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MeetingOverScreen;

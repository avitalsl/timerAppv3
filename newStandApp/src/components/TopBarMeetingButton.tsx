import React from 'react';
import { Play } from 'lucide-react';
import { useOverlay } from '../contexts/OverlayContext';

/**
 * A button component that appears in the top bar to start an active meeting
 * Uses the overlay context to control visibility of the meeting overlay
 */
export const TopBarMeetingButton: React.FC = () => {
  const { showOverlay } = useOverlay();

  return (
    <button
      className="flex items-center gap-2 px-4 py-2 bg-primary-buttonColor text-black rounded-md hover:bg-primary-buttonHover transition-colors"
      onClick={showOverlay}
      data-testid="start-meeting-button"
    >
      <Play className="h-4 w-4" />
      <span className="font-bold">Start Meeting</span>
    </button>
  );
};

export default TopBarMeetingButton;

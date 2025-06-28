import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { useMeeting } from '../contexts/MeetingContext';
import { useComponentVisibility } from '../hooks/useComponentVisibility';
import { meetingSettingsService } from '../services/meetingSettingsService';

/**
 * Function to get all initial meeting settings using the new storage services
 * This centralizes all storage access in one place with consistent error handling
 */

export default function TopBarMeetingButton() {
  const { dispatch, state: meetingState } = useMeeting(); // Get state directly here
  const { visibleComponents } = useComponentVisibility().visibilityConfig;
  const [hasLoggedInitialConfig, setHasLoggedInitialConfig] = useState(false);

  const handleClick = () => {
    // Get all necessary settings from the storage service
    const { timerConfig, participants, kickoffSettings, participantListVisibilityMode } = meetingSettingsService.getAllSettings(visibleComponents);
    // Start the meeting in the context, which will also make the UI visible
    dispatch({
      type: 'START_MEETING',
      payload: {
        storedTimerConfig: timerConfig,
        participants,
        kickoffSettings,
        selectedGridComponentIds: visibleComponents,
        participantListVisibilityMode
      }
    });

    // No longer need to call showOverlay() separately
  };

  // Get the meeting state directly to avoid excessive context calls
  // const { state: meetingState } = useMeeting(); // Already fetched above

  useEffect(() => {
    // Reset the log flag when the meeting is no longer active, so it can log for the next meeting
    if (!meetingState.isMeetingActive && hasLoggedInitialConfig) {
      setHasLoggedInitialConfig(false);
    }
  }, [meetingState.isMeetingActive, hasLoggedInitialConfig]);

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 bg-primary-buttonColor text-black rounded-md hover:bg-primary-buttonHover transition-colors"
      data-testid="start-meeting-button"
    >
      <Play size={20} />
      <span>Start Meeting</span>
    </button>
  );
};

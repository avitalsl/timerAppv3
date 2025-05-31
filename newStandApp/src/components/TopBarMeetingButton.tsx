import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { useOverlay } from '../contexts/OverlayContext';
import { useMeeting } from '../contexts/MeetingContext';
import { useComponentVisibility } from '../hooks/useComponentVisibility';
import { meetingSettingsService } from '../services/meetingSettingsService';

/**
 * Function to get all initial meeting settings using the new storage services
 * This centralizes all storage access in one place with consistent error handling
 */
function getInitialMeetingSettings() {
  // Get all settings from the meetingSettingsService
  const  settings = meetingSettingsService.getAllSettings();
  console.log('Initial meeting settings:', settings);
  return settings;
}

export default function TopBarMeetingButton() {
  const { showOverlay, isOverlayVisible } = useOverlay();
  const { dispatch } = useMeeting();
  const [hasLoggedInitialConfig, setHasLoggedInitialConfig] = useState(false);

  const handleClick = () => {
    // Get all necessary settings from the storage service
    const { timerConfig, participants, kickoffSettings, participantListVisibilityMode, visibleComponents } = getInitialMeetingSettings();
    console.log('Start Meeting settings:', {
      timerConfig,
      participants,
      kickoffSettings,
      participantListVisibilityMode,
      visibleComponents
    });
    // Start the meeting in the context
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

    // Open the overlay
    showOverlay();
  };

  // Get the meeting state directly to avoid excessive context calls
  const { state: meetingState } = useMeeting();
  
  useEffect(() => {
    // Log when meeting starts and overlay is visible, but only once per meeting start
    if (meetingState.isMeetingActive && meetingState.timerStatus === 'running' && isOverlayVisible && !hasLoggedInitialConfig) {
      // Using JSON.parse(JSON.stringify(...)) for a deep copy to ensure the logged object is a snapshot
      if (process.env.NODE_ENV === 'development') {
        console.log('[TopBarMeetingButton] Meeting started with config:', JSON.parse(JSON.stringify({
          timerConfig: meetingState.timerConfig,
          participantsCount: meetingState.participants.length,
          kickoffSettings: meetingState.kickoffSettings,
          selectedComponents: meetingState.selectedGridComponentIds
        })));
      }
      setHasLoggedInitialConfig(true);
    }
  }, [meetingState, isOverlayVisible, hasLoggedInitialConfig]);

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

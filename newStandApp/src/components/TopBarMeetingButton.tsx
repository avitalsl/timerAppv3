import React from 'react';
import { Play } from 'lucide-react';
import { useOverlay } from '../contexts/OverlayContext';
import { useMeeting } from '../contexts/MeetingContext';
import type { StoredTimerConfig, Participant, KickoffSetting } from '../contexts/MeetingContext';
import { useComponentVisibility } from '../hooks/useComponentVisibility';

const TIMER_CONFIG_KEY = 'timerSetupConfig';
const PARTICIPANTS_KEY = 'participants';
const KICKOFF_SETTING_KEY = 'kickoffSetting';
const PARTICIPANT_LIST_VISIBILITY_KEY = 'participantListVisibilityMode';

const DEFAULT_TIMER_CONFIG: StoredTimerConfig = {
  mode: 'fixed',
  totalDurationMinutes: 10,
  allowExtension: false,
  extensionAmountSeconds: 300, // 5 minutes in seconds
};

const DEFAULT_KICKOFF_SETTINGS: KickoffSetting = {
  mode: 'getDownToBusiness',
  storyOption: null,
};

/**
 * Function to get all initial meeting settings from localStorage
 * This centralizes all localStorage access in one place with consistent error handling
 */
function getInitialMeetingSettings() {
  // Get timer config
  let storedTimerConfig: StoredTimerConfig = { ...DEFAULT_TIMER_CONFIG };
  try {
    const data = localStorage.getItem(TIMER_CONFIG_KEY);
    if (data) {
      storedTimerConfig = JSON.parse(data);
      console.log('[TopBarMeetingButton] Loaded timer config:', storedTimerConfig);
    } else {
      console.log('[TopBarMeetingButton] No timer config found, using default');
    }
  } catch (error) {
    console.error('[TopBarMeetingButton] Error loading timer config:', error);
  }

  // Get participants
  let participants: Participant[] = [];
  try {
    const data = localStorage.getItem(PARTICIPANTS_KEY);
    if (data) {
      participants = JSON.parse(data);
      console.log('[TopBarMeetingButton] Loaded participants:', participants.length);
    } else {
      console.log('[TopBarMeetingButton] No participants found, using empty array');
    }
  } catch (error) {
    console.error('[TopBarMeetingButton] Error loading participants:', error);
  }

  // Get kickoff settings
  let kickoffSettings: KickoffSetting = { ...DEFAULT_KICKOFF_SETTINGS };
  try {
    const data = localStorage.getItem(KICKOFF_SETTING_KEY);
    if (data) {
      kickoffSettings = JSON.parse(data);
      console.log('[TopBarMeetingButton] Loaded kickoff settings:', kickoffSettings);
    } else {
      console.log('[TopBarMeetingButton] No kickoff settings found, using default');
    }
  } catch (error) {
    console.error('[TopBarMeetingButton] Error loading kickoff settings:', error);
  }

  // Get participant list visibility mode
  let participantListVisibilityMode: 'all_visible' | 'focus_speaker' = 'all_visible';
  try {
    const mode = localStorage.getItem(PARTICIPANT_LIST_VISIBILITY_KEY);
    if (mode === 'focus_speaker' || mode === 'all_visible') {
      participantListVisibilityMode = mode;
    }
    console.log('[TopBarMeetingButton] Loaded visibility mode:', participantListVisibilityMode);
  } catch (error) {
    console.error('[TopBarMeetingButton] Error loading visibility mode:', error);
  }

  // We'll get the selected components from the hook instead of directly from localStorage

  return {
    storedTimerConfig,
    participants,
    kickoffSettings,
    participantListVisibilityMode,
  };
}

export const TopBarMeetingButton: React.FC = () => {
  const { showOverlay } = useOverlay();
  const { dispatch } = useMeeting();
  const { visibilityConfig } = useComponentVisibility();

  // Get all meeting settings at once using useMemo to ensure it only runs once
  const initialSettings = React.useMemo(() => getInitialMeetingSettings(), []);

  const handleStartMeeting = () => {
    // Dispatch the START_MEETING action with all settings and the selected components from the visibility hook
    dispatch({
      type: 'START_MEETING',
      payload: {
        ...initialSettings,
        selectedGridComponentIds: visibilityConfig.visibleComponents
      },
    });

    showOverlay();
  };

  return (
    <button
      className="flex items-center gap-2 px-4 py-2 bg-primary-buttonColor text-black rounded-md hover:bg-primary-buttonHover transition-colors"
      onClick={handleStartMeeting}
      data-testid="start-meeting-button"
    >
      <Play className="h-4 w-4" />
      <span className="font-bold">Start Meeting</span>
    </button>
  );
};

export default TopBarMeetingButton;

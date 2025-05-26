import React from 'react';
import { Play } from 'lucide-react';
import { useOverlay } from '../contexts/OverlayContext';
import { useMeeting } from '../contexts/MeetingContext';
import type { StoredTimerConfig, Participant, KickoffSetting } from '../contexts/MeetingContext';
import type { LayoutConfiguration } from '../types/layoutTypes';

const TIMER_CONFIG_KEY = 'timerSetupConfig';
const PARTICIPANTS_KEY = 'participants';
const KICKOFF_SETTING_KEY = 'kickoffSetting';
const LAYOUT_CONFIG_KEY = 'meetingLayoutConfig';
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

  // Get selected grid components from layout config
  let selectedGridComponentIds: string[] = [];
  try {
    const data = localStorage.getItem(LAYOUT_CONFIG_KEY);
    if (data) {
      const parsedLayoutConfig: LayoutConfiguration = JSON.parse(data);
      if (parsedLayoutConfig && parsedLayoutConfig.components) {
        selectedGridComponentIds = Object.entries(parsedLayoutConfig.components)
          .filter(([_, component]) => component.visible)
          .map(([id]) => id);
        console.log('[TopBarMeetingButton] Loaded grid components:', selectedGridComponentIds);
      }
    } else {
      console.log('[TopBarMeetingButton] No layout config found, using empty grid');
    }
  } catch (error) {
    console.error('[TopBarMeetingButton] Error loading layout config:', error);
  }

  // Get participant list visibility mode
  let participantListVisibilityMode: 'all_visible' | 'focus_speaker' = 'all_visible';
  try {
    const data = localStorage.getItem(PARTICIPANT_LIST_VISIBILITY_KEY);
    if (data === 'focus_speaker' || data === 'all_visible') {
      participantListVisibilityMode = data;
      console.log('[TopBarMeetingButton] Loaded visibility mode:', participantListVisibilityMode);
    } else if (data) {
      console.warn(`[TopBarMeetingButton] Invalid visibility mode found: '${data}', using default`);
    } else {
      console.log('[TopBarMeetingButton] No visibility mode found, using default');
    }
  } catch (error) {
    console.error('[TopBarMeetingButton] Error loading visibility mode:', error);
  }

  return {
    storedTimerConfig,
    participants,
    kickoffSettings,
    selectedGridComponentIds,
    participantListVisibilityMode,
  };
}

export const TopBarMeetingButton: React.FC = () => {
  const { showOverlay } = useOverlay();
  const { dispatch } = useMeeting();

  // Get all meeting settings at once using useMemo to ensure it only runs once
  const initialSettings = React.useMemo(() => getInitialMeetingSettings(), []);

  const handleStartMeeting = () => {
    // Dispatch the START_MEETING action with all settings
    dispatch({
      type: 'START_MEETING',
      payload: initialSettings,
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

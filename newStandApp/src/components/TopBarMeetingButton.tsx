import React from 'react';
import { Play } from 'lucide-react';
import { useOverlay } from '../contexts/OverlayContext';
import { useMeeting } from '../contexts/MeetingContext';
import type { StoredTimerConfig, Participant, KickoffSetting } from '../contexts/MeetingContext';
import type { LayoutConfiguration } from '../types/layoutTypes';

const TIMER_CONFIG_KEY = 'timerConfig';
const PARTICIPANTS_KEY = 'participants';
const KICKOFF_SETTING_KEY = 'kickoffSetting';
const LAYOUT_CONFIG_KEY = 'meetingLayoutConfig';

const DEFAULT_TIMER_CONFIG: StoredTimerConfig = {
  mode: 'fixed',
  totalDurationMinutes: 10,
  allowExtension: false,
  extensionAmountMinutes: 5,
};

const DEFAULT_KICKOFF_SETTINGS: KickoffSetting = {
  mode: 'getDownToBusiness',
  storyOption: null,
};

export const TopBarMeetingButton: React.FC = () => {
  const { showOverlay } = useOverlay();
  const { dispatch } = useMeeting();

  const handleStartMeeting = () => {
    // Retrieve and parse StoredTimerConfig
    let storedTimerConfig: StoredTimerConfig = DEFAULT_TIMER_CONFIG;
    try {
      const timerConfigData = localStorage.getItem(TIMER_CONFIG_KEY);
      if (timerConfigData) {
        storedTimerConfig = JSON.parse(timerConfigData);
      } else {
        console.warn(`[TopBarMeetingButton] No timerConfig found in localStorage, using default.`);
      }
    } catch (error) {
      console.error('[TopBarMeetingButton] Error parsing timerConfig from localStorage:', error);
      // Keep default if parsing fails
    }

    // Retrieve and parse Participants
    let participants: Participant[] = [];
    try {
      const participantsData = localStorage.getItem(PARTICIPANTS_KEY);
      if (participantsData) {
        participants = JSON.parse(participantsData);
      } else {
        console.warn(`[TopBarMeetingButton] No participants found in localStorage, using empty array.`);
      }
    } catch (error) {
      console.error('[TopBarMeetingButton] Error parsing participants from localStorage:', error);
      // Keep default if parsing fails
    }
    
    // Retrieve and parse KickoffSettings
    let kickoffSettings: KickoffSetting = DEFAULT_KICKOFF_SETTINGS;
    try {
      const kickoffSettingsData = localStorage.getItem(KICKOFF_SETTING_KEY);
      if (kickoffSettingsData) {
        kickoffSettings = JSON.parse(kickoffSettingsData);
      } else {
        console.warn(`[TopBarMeetingButton] No kickoffSetting found in localStorage, using default.`);
      }
    } catch (error) {
      console.error('[TopBarMeetingButton] Error parsing kickoffSetting from localStorage:', error);
      // Keep default if parsing fails
    }

    // Retrieve and parse LayoutConfiguration to get selected grid components
    let selectedGridComponentIds: string[] = [];
    try {
      const layoutConfigData = localStorage.getItem(LAYOUT_CONFIG_KEY);
      if (layoutConfigData) {
        const parsedLayoutConfig: LayoutConfiguration = JSON.parse(layoutConfigData);
        if (parsedLayoutConfig && parsedLayoutConfig.components) {
          selectedGridComponentIds = Object.entries(parsedLayoutConfig.components)
            .filter(([_, component]) => component.visible)
            .map(([id]) => id);
        }
      } else {
        console.warn(`[TopBarMeetingButton] No layoutConfig found in localStorage, defaulting to no extra grid components.`);
      }
    } catch (error) {
      console.error('[TopBarMeetingButton] Error parsing layoutConfig from localStorage:', error);
      // Keep default (empty array) if parsing fails
    }

    dispatch({
      type: 'START_MEETING',
      payload: {
        storedTimerConfig,
        participants,
        kickoffSettings,
        selectedGridComponentIds,
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

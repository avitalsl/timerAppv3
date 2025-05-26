import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useMeeting, type StoredTimerConfig, type Participant, type KickoffSetting } from './MeetingContext';
import type { LayoutConfiguration } from '../types/layoutTypes';

// LocalStorage Keys
const KICKOFF_SETTING_KEY = 'kickoffSetting';
const TIMER_SETUP_STORAGE_KEY = 'timerSetupConfig';
const PARTICIPANTS_STORAGE_KEY = 'participantsList';
const LAYOUT_CONFIG_KEY = 'meetingLayoutConfig';

// Define the shape of our context
interface OverlayContextType {
  isOverlayVisible: boolean;
  showOverlay: () => void;
  hideOverlay: () => void;
  toggleOverlay: () => void;
}

// Create context with default values
const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

// Provider props type
interface OverlayProviderProps {
  children: ReactNode;
}

/**
 * Provider component for managing the overlay visibility state
 * 
 * @param children - Child components that will have access to this context
 */
export const OverlayProvider: React.FC<OverlayProviderProps> = ({ children }) => {
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false);
  const { dispatch: meetingDispatch } = useMeeting(); // Get dispatch from MeetingContext

  const showOverlay = () => {
    console.log('[OverlayContext] showOverlay called');
    // Load configurations from localStorage
    let storedTimerConfig: StoredTimerConfig = {
      mode: 'fixed',
      totalDurationMinutes: 15,
      allowExtension: false,
    };
    try {
      const rawTimerConfig = localStorage.getItem(TIMER_SETUP_STORAGE_KEY);
      if (rawTimerConfig) storedTimerConfig = JSON.parse(rawTimerConfig);
    } catch (e) { console.error('Error parsing timerSetupConfig from localStorage', e); }

    let participantsList: Participant[] = [];
    try {
      const rawParticipants = localStorage.getItem(PARTICIPANTS_STORAGE_KEY);
      if (rawParticipants) participantsList = JSON.parse(rawParticipants);
      if (!Array.isArray(participantsList)) participantsList = []; // Ensure it's an array
    } catch (e) { console.error('Error parsing participantsList from localStorage', e); }

    let kickoffSettings: KickoffSetting = {
      mode: 'getDownToBusiness',
      storyOption: null,
    };
    try {
      const rawKickoff = localStorage.getItem(KICKOFF_SETTING_KEY);
      if (rawKickoff) kickoffSettings = JSON.parse(rawKickoff);
    } catch (e) { console.error('Error parsing kickoffSetting from localStorage', e); }

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
        console.warn(`[OverlayContext] No layoutConfig found in localStorage, defaulting to no extra grid components.`);
      }
    } catch (error) {
      console.error('[OverlayContext] Error parsing layoutConfig from localStorage:', error);
      // Keep default (empty array) if parsing fails
    }

    // Dispatch START_MEETING action
    meetingDispatch({
      type: 'START_MEETING',
      payload: {
        storedTimerConfig,
        participants: participantsList.filter(p => p.included), // Ensure only included participants are passed
        kickoffSettings,
        selectedGridComponentIds,
      },
    });
    setIsOverlayVisible(true);
  };

  const hideOverlay = () => {
    console.log('[OverlayContext] hideOverlay called');
    meetingDispatch({ type: 'END_MEETING' });
    setIsOverlayVisible(false);
  };

  const toggleOverlay = () => {
    if (isOverlayVisible) {
      hideOverlay();
    } else {
      showOverlay();
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isOverlayVisible,
    showOverlay,
    hideOverlay,
    toggleOverlay
  }), [isOverlayVisible, meetingDispatch]); // Added meetingDispatch to dependencies of useMemo

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}
    </OverlayContext.Provider>
  );
};

/**
 * Custom hook to access overlay context
 * 
 * @returns The overlay context value
 * @throws Error if used outside of OverlayProvider
 */
export const useOverlay = (): OverlayContextType => {
  const context = useContext(OverlayContext);
  
  if (context === undefined) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  
  return context;
};

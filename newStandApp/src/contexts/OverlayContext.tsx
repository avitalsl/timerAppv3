import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useMeeting } from './MeetingContext';

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
    // The MeetingContext state should already be set by the component initiating the meeting (e.g., TopBarMeetingButton).
    // This function is now only responsible for making the overlay visible.
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

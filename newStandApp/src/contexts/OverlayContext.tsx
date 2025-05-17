import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

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

  const showOverlay = () => setIsOverlayVisible(true);
  const hideOverlay = () => setIsOverlayVisible(false);
  const toggleOverlay = () => setIsOverlayVisible(prev => !prev);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    isOverlayVisible,
    showOverlay,
    hideOverlay,
    toggleOverlay
  }), [isOverlayVisible]);

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

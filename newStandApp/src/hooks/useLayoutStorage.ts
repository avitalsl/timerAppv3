import { useState, useMemo } from 'react';
import type { LayoutConfiguration } from '../types/layoutTypes';
import { DEFAULT_LAYOUT_CONFIG } from '../types/layoutTypes';

// Function to get initial layout config from localStorage
function getInitialLayoutConfig(storageKey: string): { config: LayoutConfiguration; isLoaded: boolean } {
  try {
    console.log('[useLayoutStorage] Getting initial layout config');
    const storedConfig = localStorage.getItem(storageKey);
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      console.log('[useLayoutStorage] Loaded config:', parsedConfig);
      return { config: parsedConfig, isLoaded: true };
    } else {
      console.log('[useLayoutStorage] No config found in localStorage, using default');
    }
  } catch (error) {
    console.error('[useLayoutStorage] Error loading config:', error);
  }
  return { config: DEFAULT_LAYOUT_CONFIG, isLoaded: true };
}

export function useLayoutStorage(key: string = 'meetingLayoutConfig') {
  // Get initial state using useMemo to ensure it only runs once during initialization
  const initialState = useMemo(() => getInitialLayoutConfig(key), [key]);
  
  // Initialize state with values from localStorage
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfiguration>(initialState.config);
  const [isLoaded] = useState(initialState.isLoaded);
  // Save layout to localStorage whenever it changes
  const saveLayout = (newConfig: LayoutConfiguration) => {
    try {
      console.log('[useLayoutStorage] Saving new layout configuration:', newConfig);
      localStorage.setItem(key, JSON.stringify(newConfig));
      setLayoutConfig(newConfig);
      console.log('[useLayoutStorage] Layout saved successfully');
    } catch (error) {
      console.error('[useLayoutStorage] Error saving layout configuration:', error);
    }
  };

  return { layoutConfig, saveLayout, isLoaded };
}

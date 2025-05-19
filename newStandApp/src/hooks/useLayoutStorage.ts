import { useState, useEffect } from 'react';
import type { LayoutConfiguration } from '../types/layoutTypes';
import { DEFAULT_LAYOUT_CONFIG } from '../types/layoutTypes';

export function useLayoutStorage(key: string = 'meetingLayoutConfig') {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfiguration>(DEFAULT_LAYOUT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load layout from localStorage on component mount
  useEffect(() => {
    try {
      console.log('[useLayoutStorage] Attempting to load config from localStorage');
      const storedConfig = localStorage.getItem(key);
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        console.log('[useLayoutStorage] Loaded config:', parsedConfig);
        setLayoutConfig(parsedConfig);
      } else {
        console.log('[useLayoutStorage] No config found in localStorage');
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('[useLayoutStorage] Error loading config:', error);
      setIsLoaded(true);
    }
  }, [key]);
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

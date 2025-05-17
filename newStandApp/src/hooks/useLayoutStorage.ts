import { useState, useEffect } from 'react';
import type { LayoutConfiguration } from '../types/layoutTypes';
import { DEFAULT_LAYOUT_CONFIG } from '../types/layoutTypes';

export function useLayoutStorage(key: string = 'meetingLayoutConfig') {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfiguration>(DEFAULT_LAYOUT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load layout from localStorage on component mount
  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem(key);
      if (storedConfig) {
        setLayoutConfig(JSON.parse(storedConfig));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading layout configuration:', error);
      setIsLoaded(true);
    }
  }, [key]);

  // Save layout to localStorage whenever it changes
  const saveLayout = (newConfig: LayoutConfiguration) => {
    try {
      localStorage.setItem(key, JSON.stringify(newConfig));
      setLayoutConfig(newConfig);
    } catch (error) {
      console.error('Error saving layout configuration:', error);
    }
  };

  return { layoutConfig, saveLayout, isLoaded };
}

import { useState, useMemo } from 'react';
import type { LayoutConfiguration } from '../types/layoutTypes';
import { layoutStorageService } from '../services/layoutStorageService';

/**
 * Custom hook for managing layout configuration with persistence
 */
export function useLayoutStorage() {
  // Get initial state using useMemo to ensure it only runs once during initialization
  const initialConfig = useMemo(() => {
    return layoutStorageService.getLayoutConfig();
  }, []);
  
  // Initialize state with values from storage service
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfiguration>(initialConfig);
  const [isLoaded] = useState(true);

  // Save layout using the storage service
  const saveLayout = (newConfig: LayoutConfiguration) => {
    const success = layoutStorageService.saveLayoutConfig(newConfig);
    if (success) {
      setLayoutConfig(newConfig);
    } else {
      console.error('[useLayoutStorage] Failed to save layout configuration');
    }
  };

  return { layoutConfig, saveLayout, isLoaded };
}

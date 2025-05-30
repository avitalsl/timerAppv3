import { useState, useMemo } from 'react';
import type { ComponentVisibilityConfig } from '../types/componentVisibilityTypes';
import { DEFAULT_VISIBILITY_CONFIG } from '../types/componentVisibilityTypes';

/**
 * Function to get initial component visibility config from localStorage
 */
function getInitialVisibilityConfig(storageKey: string): { config: ComponentVisibilityConfig; isLoaded: boolean } {
  try {
    console.log('[useComponentVisibility] Getting initial component visibility config');
    const storedConfig = localStorage.getItem(storageKey);
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      
      // Handle migration from old layout format if needed
      if (parsedConfig.components) {
        console.log('[useComponentVisibility] Migrating from old layout format');
        const visibleComponents = Object.entries(parsedConfig.components)
          .filter(([_, component]: [string, any]) => component.visible)
          .map(([id]: [string, any]) => id);
        
        // Save the migrated format for future use
        const migratedConfig = { visibleComponents };
        localStorage.setItem(storageKey, JSON.stringify(migratedConfig));
        
        return { 
          config: migratedConfig, 
          isLoaded: true 
        };
      }
      
      console.log('[useComponentVisibility] Loaded config:', parsedConfig);
      return { config: parsedConfig, isLoaded: true };
    } else {
      console.log('[useComponentVisibility] No config found in localStorage, using default');
    }
  } catch (error) {
    console.error('[useComponentVisibility] Error loading config:', error);
  }
  return { config: DEFAULT_VISIBILITY_CONFIG, isLoaded: true };
}

/**
 * Hook for managing component visibility state
 */
export function useComponentVisibility(key: string = 'meetingComponentsConfig') {
  // Get initial state using useMemo to ensure it only runs once during initialization
  const initialState = useMemo(() => getInitialVisibilityConfig(key), [key]);
  
  // Initialize state with values from localStorage
  const [visibilityConfig, setVisibilityConfig] = useState<ComponentVisibilityConfig>(initialState.config);
  const [isLoaded] = useState(initialState.isLoaded);
  
  // Save visibility config to localStorage whenever it changes
  const saveVisibilityConfig = (newConfig: ComponentVisibilityConfig) => {
    try {
      console.log('[useComponentVisibility] Saving new visibility configuration:', newConfig);
      localStorage.setItem(key, JSON.stringify(newConfig));
      setVisibilityConfig(newConfig);
      console.log('[useComponentVisibility] Visibility config saved successfully');
    } catch (error) {
      console.error('[useComponentVisibility] Error saving visibility configuration:', error);
    }
  };

  // Convenience method to toggle a component's visibility
  const toggleComponentVisibility = (componentId: string, visible: boolean) => {
    const currentVisibleComponents = [...visibilityConfig.visibleComponents];
    
    if (visible && !currentVisibleComponents.includes(componentId)) {
      // Add component to visible list
      currentVisibleComponents.push(componentId);
    } else if (!visible) {
      // Remove component from visible list
      const index = currentVisibleComponents.indexOf(componentId);
      if (index !== -1) {
        currentVisibleComponents.splice(index, 1);
      }
    }

    saveVisibilityConfig({
      visibleComponents: currentVisibleComponents
    });
  };

  // Get the list of visible component IDs
  const getVisibleComponentIds = (): string[] => {
    return visibilityConfig.visibleComponents;
  };

  return { 
    visibilityConfig, 
    saveVisibilityConfig, 
    toggleComponentVisibility,
    getVisibleComponentIds,
    isLoaded
  };
}

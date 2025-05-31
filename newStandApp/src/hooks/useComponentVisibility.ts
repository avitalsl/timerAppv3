import { useState } from 'react';
import type { ComponentVisibilityConfig } from '../types/componentVisibilityTypes';
import { componentVisibilityStorageService } from '../services/componentVisibilityStorageService';

// The getInitialVisibilityConfig function is no longer needed as we're using the storage service

/**
 * Hook for managing component visibility state
 */
export function useComponentVisibility(key: string = 'meetingComponentsConfig') {
  // Initialize state with values from storage service
  const [visibilityConfig, setVisibilityConfig] = useState<ComponentVisibilityConfig>(
    () => componentVisibilityStorageService.getVisibilityConfig(key)
  );
  const [isLoaded] = useState(true); // Always consider loaded when using the storage service
  
  // Save visibility config to storage
  const saveVisibilityConfig = (newConfig: ComponentVisibilityConfig) => {
    const success = componentVisibilityStorageService.saveVisibilityConfig(newConfig, key);
    if (success) {
      setVisibilityConfig(newConfig);
    } else {
      console.error(`[useComponentVisibility] Failed to save visibility config to key: ${key}`);
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

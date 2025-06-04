// src/hooks/ComponentVisibilityProvider.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
  } from 'react';
  import type { ComponentVisibilityConfig } from '../types/componentVisibilityTypes';
  import { componentVisibilityStorageService } from '../services/componentVisibilityStorageService';
  
  // Define the shape of the context
  type ContextType = {
    visibilityConfig: ComponentVisibilityConfig;
    isLoaded: boolean;
    saveVisibilityConfig: (newConfig: ComponentVisibilityConfig) => void;
    toggleComponentVisibility: (componentId: string, visible: boolean) => void;
  };
  
  // Default config if nothing is in storage
  const DEFAULT_CONFIG: ComponentVisibilityConfig = { visibleComponents: [] };
  
  // Create context object
  export const ComponentVisibilityContext = createContext<ContextType | undefined>(undefined);
  
  // Export provider
  export const ComponentVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visibilityConfig, setVisibilityConfig] = useState<ComponentVisibilityConfig>(DEFAULT_CONFIG);
    const [isLoaded, setIsLoaded] = useState(false);
  
    useEffect(() => {
      const config = componentVisibilityStorageService.getVisibilityConfig();
      setVisibilityConfig(config ?? DEFAULT_CONFIG);
      setIsLoaded(true);
    }, []);
  
    const saveVisibilityConfig = useCallback((newConfig: ComponentVisibilityConfig) => {
      const success = componentVisibilityStorageService.saveVisibilityConfig(newConfig, 'meetingComponentsConfig');
      if (success) {
        setVisibilityConfig(newConfig);
      } else {
        console.error('[ComponentVisibilityProvider] Failed to save visibility config');
      }
    }, []);
  
    const toggleComponentVisibility = useCallback((componentId: string, visible: boolean) => {
      const current = visibilityConfig.visibleComponents;
      let updated: string[];
  
      if (visible && !current.includes(componentId)) {
        updated = [...current, componentId];
      } else if (!visible && current.includes(componentId)) {
        updated = current.filter((id) => id !== componentId);
      } else {
        updated = current;
      }
  
      if (updated !== current) {
        saveVisibilityConfig({ visibleComponents: updated });
      }
    }, [visibilityConfig, saveVisibilityConfig]);
  
    return (
      <ComponentVisibilityContext.Provider
        value={{ visibilityConfig, isLoaded, saveVisibilityConfig, toggleComponentVisibility }}
      >
        {children}
      </ComponentVisibilityContext.Provider>
    );
  };
  
  // Export hook
  export function useComponentVisibility() {
    const ctx = useContext(ComponentVisibilityContext);
    if (!ctx) {
      throw new Error('useComponentVisibility must be used within a ComponentVisibilityProvider');
    }
    return ctx;
  }
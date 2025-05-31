import { storageService } from './storageService';
import type { ComponentVisibilityConfig } from '../types/componentVisibilityTypes';
import { DEFAULT_VISIBILITY_CONFIG } from '../types/componentVisibilityTypes';

const VISIBILITY_STORAGE_KEY = 'meetingComponentsConfig';

/**
 * Service for storing and retrieving component visibility configuration
 */
export const componentVisibilityStorageService = {
  /**
   * Get component visibility configuration from storage
   * @param key Optional custom storage key, defaults to 'meetingComponentsConfig'
   * @returns The visibility configuration or default values if none is stored
   */
  getVisibilityConfig(key: string = VISIBILITY_STORAGE_KEY): ComponentVisibilityConfig {
    return storageService.get<ComponentVisibilityConfig>(
      key, 
      DEFAULT_VISIBILITY_CONFIG,
      {
        validate: (value): value is ComponentVisibilityConfig => {
          return value !== null &&
                 typeof value === 'object' &&
                 'visibleComponents' in value &&
                 Array.isArray(value.visibleComponents);
        },
        migrate: (legacyData: any): ComponentVisibilityConfig => {
          // Handle migration from old layout format if needed
          if (legacyData && legacyData.components) {
            const visibleComponents = Object.entries(legacyData.components)
              .filter(([_, component]: [string, any]) => component.visible)
              .map(([id]: [string, any]) => id);
            
            return { visibleComponents };
          }
          
          // If it's already in the right format but needs validation
          if (legacyData && Array.isArray(legacyData.visibleComponents)) {
            return { 
              visibleComponents: legacyData.visibleComponents.filter(
                (id: any) => typeof id === 'string'
              )
            };
          }
          
          return DEFAULT_VISIBILITY_CONFIG;
        }
      }
    );
  },
  
  /**
   * Save component visibility configuration to storage
   * @param config The visibility configuration to save
   * @param key Optional custom storage key, defaults to 'meetingComponentsConfig'
   * @returns true if saved successfully, false otherwise
   */
  saveVisibilityConfig(config: ComponentVisibilityConfig, key: string = VISIBILITY_STORAGE_KEY): boolean {
    return storageService.set(key, config);
  }
};

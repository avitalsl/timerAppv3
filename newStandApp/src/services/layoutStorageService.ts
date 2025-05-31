import { storageService } from './storageService';
import type { LayoutConfiguration } from '../types/layoutTypes';
import { DEFAULT_LAYOUT_CONFIG } from '../types/layoutTypes';

const LAYOUT_CONFIG_KEY = 'meetingLayoutConfig';

/**
 * Service for managing layout configuration persistence
 */
export const layoutStorageService = {
  /**
   * Retrieves layout configuration from storage
   * @returns The stored layout configuration or default if not found
   */
  getLayoutConfig(): LayoutConfiguration {
    try {
      const config = storageService.get<LayoutConfiguration>(
        LAYOUT_CONFIG_KEY,
        DEFAULT_LAYOUT_CONFIG
      );
      return config;
    } catch (error) {
      console.error('[layoutStorageService] Error retrieving layout config:', error);
      return DEFAULT_LAYOUT_CONFIG;
    }
  },

  /**
   * Saves layout configuration to storage
   * @param config The layout configuration to save
   * @returns true if successful, false otherwise
   */
  saveLayoutConfig(config: LayoutConfiguration): boolean {
    try {
      return storageService.set(LAYOUT_CONFIG_KEY, config);
    } catch (error) {
      console.error('[layoutStorageService] Error saving layout config:', error);
      return false;
    }
  }
};

// No imports needed

/**
 * Simplified configuration for component visibility
 */
export interface ComponentVisibilityConfig {
  visibleComponents: string[];
}

/**
 * Default configuration with only timer visible
 */
export const DEFAULT_VISIBILITY_CONFIG: ComponentVisibilityConfig = {
  visibleComponents: ['timer']
};

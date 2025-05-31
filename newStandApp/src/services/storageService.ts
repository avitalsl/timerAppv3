/**
 * Core service for interacting with localStorage
 * Acts as an abstraction layer to handle all serialization, deserialization, and error handling
 */
export const storageService = {
  // App-specific prefix to avoid key collisions with other applications
  PREFIX: 'timerApp/',
  
  /**
   * Apply consistent prefix to all keys
   * @param key The base key
   * @returns Prefixed key
   */
  withPrefix(key: string): string {
    return `${this.PREFIX}${key}`;
  },
  
  /**
   * Get a value from localStorage
   * @param key The localStorage key (will be prefixed automatically)
   * @param defaultValue Value to return if key doesn't exist or is invalid
   * @param options Optional configuration
   * @returns The parsed value or defaultValue if not found/invalid
   */
  get<T>(
    key: string, 
    defaultValue: T, 
    options?: {
      validate?: (value: unknown) => value is T;
      migrate?: (legacyData: any) => T;
    }
  ): T {
    try {
      const prefixedKey = this.withPrefix(key);
      const item = localStorage.getItem(prefixedKey);
      if (item === null) return defaultValue;
      
      const parsedValue = JSON.parse(item);
      
      // Run migration if needed (for handling legacy data)
      if (options?.migrate) {
        return options.migrate(parsedValue);
      }
      
      // Validate the data if a validator is provided
      if (options?.validate && !options.validate(parsedValue)) {
        console.warn(`[storageService] Invalid data found for key "${prefixedKey}". Using default value.`);
        return defaultValue;
      }
      
      return parsedValue as T;
    } catch (error) {
      console.error(`[storageService] Error retrieving "${key}" from localStorage:`, error);
      return defaultValue;
    }
  },
  
  /**
   * Save a value to localStorage
   * @param key The localStorage key (will be prefixed automatically)
   * @param value The value to store
   * @returns true if successful, false if failed
   */
  set<T>(key: string, value: T): boolean {
    try {
      const prefixedKey = this.withPrefix(key);
      localStorage.setItem(prefixedKey, JSON.stringify(value));
      return true;
    } catch (error) {
      // Check specifically for quota exceeded errors
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.error(`[storageService] Storage quota exceeded when saving "${key}" to localStorage`);
        // Could potentially implement fallback strategy here
      } else {
        console.error(`[storageService] Error saving "${key}" to localStorage:`, error);
      }
      return false;
    }
  },
  
  /**
   * Remove a key from localStorage
   * @param key The localStorage key to remove (will be prefixed automatically)
   */
  remove(key: string): void {
    try {
      const prefixedKey = this.withPrefix(key);
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error(`[storageService] Error removing "${key}" from localStorage:`, error);
    }
  },
  
  /**
   * Clear all application data from localStorage
   * @param specificPrefix Optional additional prefix to further limit what gets cleared
   */
  clear(specificPrefix?: string): void {
    try {
      // Always use app prefix to avoid clearing data from other applications
      const targetPrefix = specificPrefix 
        ? this.withPrefix(specificPrefix)
        : this.PREFIX;
      
      // Only clear items with the app prefix
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(targetPrefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('[storageService] Error clearing localStorage:', error);
    }
  }
};

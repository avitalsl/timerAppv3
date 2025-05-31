import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';

/**
 * Options for usePersistentState hook
 */
interface PersistentStateOptions<T> {
  validate?: (value: unknown) => value is T;
  migrate?: (legacyData: any) => T;
  onError?: (error: Error) => void;
}

/**
 * Custom React hook for persistent state management
 * Works similarly to useState but automatically syncs with localStorage
 * 
 * @param key Storage key for the state
 * @param initialValue Default value if nothing is stored
 * @param options Additional options for validation and migration
 * @returns [state, setState, resetState] tuple similar to useState but with reset capability
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  options?: PersistentStateOptions<T>
): [T, (value: T | ((prevState: T) => T)) => void, () => void] {
  // Initialize state with the value from localStorage or default
  const [state, setState] = useState<T>(() => {
    return storageService.get<T>(key, initialValue, {
      validate: options?.validate,
      migrate: options?.migrate
    });
  });

  // Effect to update localStorage when state changes
  useEffect(() => {
    try {
      const success = storageService.set(key, state);
      if (!success && options?.onError) {
        options.onError(new Error(`Failed to save state for key: ${key}`));
      }
    } catch (error) {
      if (options?.onError) {
        options.onError(error instanceof Error ? error : new Error(`Unknown error saving state for key: ${key}`));
      }
    }
  }, [key, state, options]);

  // Custom setter that syncs with localStorage
  const setPersistedState = useCallback((value: T | ((prevState: T) => T)) => {
    setState(prevState => {
      const nextState = value instanceof Function ? value(prevState) : value;
      return nextState;
    });
  }, []);

  // Reset function to revert to initial value
  const resetState = useCallback(() => {
    setState(initialValue);
  }, [initialValue]);

  return [state, setPersistedState, resetState];
}

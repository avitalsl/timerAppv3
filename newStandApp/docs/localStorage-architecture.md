# 🧱 Modular and Robust State Persistence Architecture

This document outlines our application's localStorage state management architecture, designed to improve modularity, reduce repetition, handle errors safely, and ease long-term maintenance.

## 📋 Implementation Status

**Status: COMPLETED ✅**

All components have been refactored to use the modular storage services instead of direct localStorage access. The architecture provides a consistent, type-safe, and error-handled approach to state persistence across the application.

## 🔍 Overview

Our state persistence architecture follows a layered approach:

1. **Base Layer**: The core `storageService` handles all direct localStorage interactions with robust error handling
2. **Domain Layer**: Type-specific storage services for different parts of the application state
3. **Integration Layer**: React hooks and context providers that integrate the storage services into components
4. **Centralized Access**: A unified `meetingSettingsService` for accessing all settings in one place

This approach ensures consistency, improves maintainability, and provides robust error handling throughout the application.

### Implemented Storage Services

1. **Base Storage Service** (`storageService.ts`)
   - Core service that handles all direct localStorage interactions
   - Provides error handling, serialization, and deserialization
   - Implements prefix mechanism to avoid key collisions
   - Supports data validation and migration for handling legacy data formats

2. **Domain-Specific Storage Services**
   - `kickoffSettingsStorageService.ts` - Manages kickoff mode settings
   - `participantsStorageService.ts` - Manages participant list
   - `participantListVisibilityStorageService.ts` - Manages participant list visibility mode
   - `timerConfigStorageService.ts` - Manages timer configuration
   - `componentVisibilityStorageService.ts` - Manages component visibility settings
   - `layoutStorageService.ts` - Manages layout configuration

3. **Custom React Hooks**
   - `usePersistentState.ts` - Generic hook for persisting any state to localStorage
   - `useComponentVisibility.ts` - Manages component visibility with persistence
   - `useLayoutStorage.ts` - Manages layout configuration with persistence

4. **Centralized Access**
   - `meetingSettingsService.ts` - Provides unified access to all meeting-related settings

## 🎯 Goals

* Eliminate repetitive boilerplate for loading/saving state from/to localStorage
* Prevent silent failures due to JSON parsing or writing errors
* Improve maintainability and testability
* Centralize all localStorage access for future flexibility

## 🚀 Implementation Steps

### 1. Create Base Storage Service (`src/services/storageService.ts`)

```typescript
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
```

### 2. Create Type-Specific Storage Services

#### 2.1 Layout Storage Service (`src/services/layoutStorageService.ts`)

```typescript
import { storageService } from './storageService';
import type { LayoutConfiguration } from '../types/layoutTypes';
import { DEFAULT_LAYOUT_CONFIG } from '../types/layoutTypes';

const LAYOUT_STORAGE_KEY = 'meetingLayoutConfig';

export const layoutStorageService = {
  /**
   * Get layout configuration
   */
  getLayoutConfig(): LayoutConfiguration {
    return storageService.get<LayoutConfiguration>(
      LAYOUT_STORAGE_KEY,
      DEFAULT_LAYOUT_CONFIG,
      {
        validate: (value): value is LayoutConfiguration => {
          return value !== null && 
                 typeof value === 'object' && 
                 'layouts' in value && 
                 'components' in value;
        }
      }
    );
  },
  
  /**
   * Save layout configuration
   */
  saveLayoutConfig(config: LayoutConfiguration): boolean {
    return storageService.set(LAYOUT_STORAGE_KEY, config);
  }
};
```

#### 2.2 Component Visibility Service (`src/services/componentVisibilityService.ts`)

```typescript
import { storageService } from './storageService';
import type { ComponentVisibilityConfig } from '../types/componentVisibilityTypes';
import { DEFAULT_VISIBILITY_CONFIG } from '../types/componentVisibilityTypes';

const VISIBILITY_STORAGE_KEY = 'meetingComponentsConfig';

export const componentVisibilityService = {
  /**
   * Get component visibility configuration
   */
  getVisibilityConfig(): ComponentVisibilityConfig {
    return storageService.get<ComponentVisibilityConfig>(
      VISIBILITY_STORAGE_KEY, 
      DEFAULT_VISIBILITY_CONFIG,
      {
        validate: (value): value is ComponentVisibilityConfig => {
          return value !== null &&
                 typeof value === 'object' &&
                 'visibleComponents' in value &&
                 Array.isArray(value.visibleComponents);
        },
        migrate: (legacyData) => {
          // Handle migration from old layout format if needed
          if (legacyData.components) {
            const visibleComponents = Object.entries(legacyData.components)
              .filter(([_, component]: [string, any]) => component.visible)
              .map(([id]: [string, any]) => id);
            
            return { visibleComponents };
          }
          return DEFAULT_VISIBILITY_CONFIG;
        }
      }
    );
  },
  
  /**
   * Save component visibility configuration
   */
  saveVisibilityConfig(config: ComponentVisibilityConfig): boolean {
    return storageService.set(VISIBILITY_STORAGE_KEY, config);
  }
};
```

#### 2.3 Timer Configuration Service (`src/services/timerConfigService.ts`)

```typescript
import { storageService } from './storageService';
import type { StoredTimerConfig } from '../contexts/MeetingContext';

const TIMER_CONFIG_STORAGE_KEY = 'timerSetupConfig';

const DEFAULT_TIMER_CONFIG: StoredTimerConfig = {
  mode: 'per-participant',
  durationPerParticipantSeconds: 60,
  allowExtension: false,
  extensionAmountSeconds: 60
};

export const timerConfigService = {
  /**
   * Get timer configuration
   */
  getTimerConfig(): StoredTimerConfig {
    return storageService.get<StoredTimerConfig>(
      TIMER_CONFIG_STORAGE_KEY,
      DEFAULT_TIMER_CONFIG,
      {
        validate: (value): value is StoredTimerConfig => {
          return value !== null &&
                 typeof value === 'object' &&
                 'mode' in value &&
                 (value.mode === 'fixed' || value.mode === 'per-participant');
        },
        migrate: (legacyData) => {
          // Handle migrating from minutes to seconds if needed
          return {
            mode: legacyData.mode === 'fixed' || legacyData.mode === 'per-participant' 
                ? legacyData.mode 
                : 'per-participant',
            totalDurationMinutes: typeof legacyData.totalDurationMinutes === 'number' 
                ? legacyData.totalDurationMinutes 
                : undefined,
            durationPerParticipantSeconds: typeof legacyData.durationPerParticipantSeconds === 'number' 
                ? legacyData.durationPerParticipantSeconds 
                : typeof legacyData.perParticipantMinutes === 'number' 
                ? legacyData.perParticipantMinutes * 60 
                : 60,
            allowExtension: typeof legacyData.allowExtension === 'boolean' 
                ? legacyData.allowExtension 
                : false,
            extensionAmountSeconds: typeof legacyData.extensionAmountSeconds === 'number' 
                ? legacyData.extensionAmountSeconds 
                : typeof legacyData.extensionAmountMinutes === 'number' 
                ? legacyData.extensionAmountMinutes * 60 
                : 60
          };
        }
      }
    );
  },
  
  /**
   * Save timer configuration
   */
  saveTimerConfig(config: StoredTimerConfig): boolean {
    return storageService.set(TIMER_CONFIG_STORAGE_KEY, config);
  }
};
```

#### 2.4 Kickoff Settings Service (`src/services/kickoffSettingsService.ts`)

```typescript
import { storageService } from './storageService';
import type { KickoffSetting } from '../contexts/MeetingContext';

const KICKOFF_SETTINGS_STORAGE_KEY = 'kickoffSetting';

const DEFAULT_KICKOFF_SETTINGS: KickoffSetting = {
  mode: 'getDownToBusiness',
  storyOption: null
};

export const kickoffSettingsService = {
  /**
   * Get kickoff settings
   */
  getKickoffSettings(): KickoffSetting {
    return storageService.get<KickoffSetting>(
      KICKOFF_SETTINGS_STORAGE_KEY,
      DEFAULT_KICKOFF_SETTINGS,
      {
        validate: (value): value is KickoffSetting => {
          return value !== null &&
                 typeof value === 'object' &&
                 'mode' in value &&
                 (value.mode === 'getDownToBusiness' || value.mode === 'storyTime');
        }
      }
    );
  },
  
  /**
   * Save kickoff settings
   */
  saveKickoffSettings(settings: KickoffSetting): boolean {
    return storageService.set(KICKOFF_SETTINGS_STORAGE_KEY, settings);
  }
};
```

### 3. Create Persistent State Hook (`src/hooks/usePersistentState.ts`)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';

/**
 * A hook for managing state that is persisted to localStorage
 * 
 * @param key The localStorage key to use
 * @param defaultValue The default value to use if the key doesn't exist
 * @param options Optional configuration options
 * @returns A tuple of [state, setState] similar to useState
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options?: {
    validate?: (value: unknown) => value is T;
    migrate?: (legacyData: any) => T;
  }
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Load initial value from localStorage
  const [state, setState] = useState<T>(() => {
    return storageService.get(key, defaultValue, options);
  });
  
  // Effect to update localStorage when state changes
  useEffect(() => {
    storageService.set(key, state);
  }, [key, state]);
  
  // Simplified: Return the setState function directly
  // This is sufficient unless you need a memoized setter for children
  return [state, setState];
}
```

### 4. Centralized Meeting Settings Service (`src/services/meetingSettingsService.ts`)

```typescript
import { timerConfigStorageService } from './timerConfigStorageService';
import { participantsStorageService } from './participantsStorageService';
import { kickoffSettingsStorageService } from './kickoffSettingsStorageService';
import { componentVisibilityStorageService } from './componentVisibilityStorageService';
import { participantListVisibilityStorageService } from './participantListVisibilityStorageService';
import type { StoredTimerConfig, Participant, KickoffSetting } from '../contexts/MeetingContext';
import type { ComponentVisibilityConfig } from '../types/componentVisibilityTypes';
import type { ParticipantListVisibilityMode } from './participantListVisibilityStorageService';

/**
 * Interface for complete meeting settings
 */
export interface MeetingSettings {
  timerConfig: StoredTimerConfig;
  participants: Participant[];
  kickoffSettings: KickoffSetting;
  visibleComponents: string[];
  participantListVisibilityMode: ParticipantListVisibilityMode;
}

/**
 * Service for accessing all meeting-related settings in one place
 */
export const meetingSettingsService = {
  /**
   * Get all meeting settings at once
   * @returns Complete meeting settings object
   */
  getAllSettings(): MeetingSettings {
    const timerConfig = timerConfigStorageService.getTimerConfig();
    const participants = participantsStorageService.getParticipants();
    const kickoffSettings = kickoffSettingsStorageService.getKickoffSettings();
    const visibilityConfig = componentVisibilityStorageService.getVisibilityConfig();
    const participantListVisibilityMode = participantListVisibilityStorageService.getVisibilityMode();

    return {
      timerConfig,
      participants,
      kickoffSettings,
      visibleComponents: visibilityConfig.visibleComponents,
      participantListVisibilityMode
    };
  },

  // Additional methods for saving specific settings
  saveTimerConfig(timerConfig: StoredTimerConfig): boolean {
    return timerConfigStorageService.saveTimerConfig(timerConfig);
  },
  
  // ... other save methods
};
```
```

## 🛡️ Error Handling

The architecture implements robust error handling at multiple levels:

### 1. Base Storage Service Error Handling

- **JSON Parsing Errors**: Safely returns default values when stored JSON is invalid
- **Storage Quota Errors**: Specifically detects and logs quota exceeded errors
- **Access Errors**: Handles errors when localStorage is unavailable (e.g., in private browsing)
- **Type Safety**: Validates data structure before returning it to the application

### 2. Domain-Specific Services Error Handling

- **Data Validation**: Each service implements type-specific validation
- **Data Migration**: Handles legacy data formats and structure changes
- **Fallback Values**: Provides sensible defaults when stored data is invalid

### 3. Component-Level Error Handling

- **Save Operation Results**: Components check if save operations succeeded
- **Loading States**: Components handle loading states gracefully
- **Feedback to Users**: Critical errors are communicated to users when appropriate

## 📊 Testing Strategy

The modular architecture enables comprehensive testing at multiple levels:

### 1. Unit Testing Storage Services

- Mock localStorage to test storage service operations
- Test error handling paths for quota exceeded, parsing errors, etc.
- Verify data validation and migration logic

### 2. Integration Testing with Components

- Test React hooks with mock storage services
- Verify component behavior with different storage states

### 3. End-to-End Testing

- Use Playwright's `page.evaluate` to set up localStorage state before tests
- Verify that UI reflects persisted state correctly
- Test error recovery paths

### Example Test Helper

```typescript
// Helper function to set up test storage state
export async function setupTestStorage(page, data) {
  await page.evaluate((storageData) => {
    // Clear existing storage first
    localStorage.clear();
    
    // Set up test data with proper prefixing
    Object.entries(storageData).forEach(([key, value]) => {
      localStorage.setItem(`timerApp/${key}`, JSON.stringify(value));
    });
    
    return true;
  }, data);
}
```

## 🧩 Usage Examples

### 1. Using Domain-Specific Storage Services

```typescript
// In a component or service
import { kickoffSettingsStorageService } from '../services/kickoffSettingsStorageService';

// Get current settings
const settings = kickoffSettingsStorageService.getKickoffSettings();

// Update settings
const success = kickoffSettingsStorageService.saveKickoffSettings({
  mode: 'storyTime',
  storyOption: 'random'
});

// Handle save result
if (!success) {
  console.error('Failed to save kickoff settings');
  // Implement fallback or user notification
}
```

### 2. Using React Hooks for Persistent State

```typescript
// In a React component
import { useComponentVisibility } from '../hooks/useComponentVisibility';

function ComponentPicker() {
  const { visibilityConfig, toggleComponentVisibility } = useComponentVisibility();
  
  const handleToggle = (componentId, isVisible) => {
    toggleComponentVisibility(componentId, isVisible);
  };
  
  return (
    <div>
      {availableComponents.map(component => (
        <Checkbox
          key={component.id}
          checked={visibilityConfig.visibleComponents.includes(component.id)}
          onChange={(e) => handleToggle(component.id, e.target.checked)}
          label={component.name}
        />
      ))}
    </div>
  );
}
```

### 3. Using the Centralized Meeting Settings Service

```typescript
// In TopBarMeetingButton.tsx
import { meetingSettingsService } from '../services/meetingSettingsService';
import { useMeeting } from '../contexts/MeetingContext';

function TopBarMeetingButton() {
  const { dispatch } = useMeeting();
  
  const handleStartMeeting = () => {
    // Get all settings at once
    const { timerConfig, participants, kickoffSettings, visibleComponents, participantListVisibilityMode } = 
      meetingSettingsService.getAllSettings();
    
    // Start meeting with all settings
    dispatch({
      type: 'START_MEETING',
      payload: {
        storedTimerConfig: timerConfig,
        participants,
        kickoffSettings,
        selectedGridComponentIds: visibleComponents,
        participantListVisibilityMode
      }
    });
  };
  
  return (
    <button onClick={handleStartMeeting}>
      Start Meeting
    </button>
  );
}
```

## 🔄 Migration Strategy

The architecture supports seamless migration from legacy data formats:

1. **Data Structure Changes**: Each storage service can include migration logic
2. **Version Detection**: Services can detect and migrate from older versions
3. **Graceful Fallbacks**: When migration fails, services fall back to defaults

## 🚀 Future Enhancements

1. **Storage Alternatives**: The architecture allows for easy replacement of localStorage with other persistence mechanisms
2. **Sync Support**: Could be extended to support synchronization with remote storage
3. **Performance Optimizations**: Consider adding memoization for frequently accessed values
4. **Batch Operations**: Implement support for batched storage updates

## 📝 Conclusion

This modular localStorage persistence architecture provides a robust foundation for state management in our application. By centralizing localStorage access through typed services with consistent error handling, we've significantly improved the maintainability, testability, and reliability of the application's state persistence.

### 4. Create Configuration Context (Optional) (`src/contexts/ConfigContext.tsx`)

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { layoutStorageService } from '../services/layoutStorageService';
import { componentVisibilityService } from '../services/componentVisibilityService';
import { timerConfigService } from '../services/timerConfigService';
import { kickoffSettingsService } from '../services/kickoffSettingsService';
import type { LayoutConfiguration } from '../types/layoutTypes';
import type { ComponentVisibilityConfig } from '../types/componentVisibilityTypes';
import type { StoredTimerConfig, KickoffSetting } from '../contexts/MeetingContext';

interface ConfigContextType {
  layoutConfig: LayoutConfiguration;
  visibilityConfig: ComponentVisibilityConfig;
  timerConfig: StoredTimerConfig;
  kickoffSettings: KickoffSetting;
  saveLayoutConfig: (config: LayoutConfiguration) => void;
  saveVisibilityConfig: (config: ComponentVisibilityConfig) => void;
  saveTimerConfig: (config: StoredTimerConfig) => void;
  saveKickoffSettings: (settings: KickoffSetting) => void;
  isLoaded: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfiguration>(
    layoutStorageService.getLayoutConfig()
  );
  
  const [visibilityConfig, setVisibilityConfig] = useState<ComponentVisibilityConfig>(
    componentVisibilityService.getVisibilityConfig()
  );
  
  const [timerConfig, setTimerConfig] = useState<StoredTimerConfig>(
    timerConfigService.getTimerConfig()
  );
  
  const [kickoffSettings, setKickoffSettings] = useState<KickoffSetting>(
    kickoffSettingsService.getKickoffSettings()
  );
  
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Set isLoaded to true after initial load
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  const saveLayoutConfig = (config: LayoutConfiguration) => {
    layoutStorageService.saveLayoutConfig(config);
    setLayoutConfig(config);
  };
  
  const saveVisibilityConfig = (config: ComponentVisibilityConfig) => {
    componentVisibilityService.saveVisibilityConfig(config);
    setVisibilityConfig(config);
  };
  
  const saveTimerConfig = (config: StoredTimerConfig) => {
    timerConfigService.saveTimerConfig(config);
    setTimerConfig(config);
  };
  
  const saveKickoffSettings = (settings: KickoffSetting) => {
    kickoffSettingsService.saveKickoffSettings(settings);
    setKickoffSettings(settings);
  };
  
  return (
    <ConfigContext.Provider
      value={{
        layoutConfig,
        visibilityConfig,
        timerConfig,
        kickoffSettings,
        saveLayoutConfig,
        saveVisibilityConfig,
        saveTimerConfig,
        saveKickoffSettings,
        isLoaded
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
```

## 🛠️ Refactoring Existing Components

### 1. Refactor `useLayoutStorage.ts`

Replace with:

```typescript
import { usePersistentState } from './usePersistentState';
import type { LayoutConfiguration } from '../types/layoutTypes';
import { DEFAULT_LAYOUT_CONFIG } from '../types/layoutTypes';

export function useLayoutStorage(key: string = 'meetingLayoutConfig') {
  const [layoutConfig, setLayoutConfig] = usePersistentState<LayoutConfiguration>(
    key,
    DEFAULT_LAYOUT_CONFIG,
    {
      validate: (value): value is LayoutConfiguration => {
        return value !== null && 
               typeof value === 'object' && 
               'layouts' in value && 
               'components' in value;
      }
    }
  );
  
  const saveLayout = (newConfig: LayoutConfiguration) => {
    setLayoutConfig(newConfig);
  };
  
  return { layoutConfig, saveLayout, isLoaded: true };
}
```

### 2. Refactor `useComponentVisibility.ts`

Replace with:

```typescript
import { usePersistentState } from './usePersistentState';
import type { ComponentVisibilityConfig } from '../types/componentVisibilityTypes';
import { DEFAULT_VISIBILITY_CONFIG } from '../types/componentVisibilityTypes';

export function useComponentVisibility(key: string = 'meetingComponentsConfig') {
  const [visibilityConfig, setVisibilityConfig] = usePersistentState<ComponentVisibilityConfig>(
    key,
    DEFAULT_VISIBILITY_CONFIG,
    {
      validate: (value): value is ComponentVisibilityConfig => {
        return value !== null &&
               typeof value === 'object' &&
               'visibleComponents' in value &&
               Array.isArray(value.visibleComponents);
      },
      migrate: (legacyData) => {
        // Handle migration from old layout format if needed
        if (legacyData.components) {
          const visibleComponents = Object.entries(legacyData.components)
            .filter(([_, component]: [string, any]) => component.visible)
            .map(([id]: [string, any]) => id);
          
          return { visibleComponents };
        }
        return DEFAULT_VISIBILITY_CONFIG;
      }
    }
  );
  
  const saveVisibilityConfig = (newConfig: ComponentVisibilityConfig) => {
    setVisibilityConfig(newConfig);
  };
  
  const toggleComponentVisibility = (componentId: string, visible: boolean) => {
    setVisibilityConfig(prev => {
      const currentVisibleComponents = [...prev.visibleComponents];
      
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
      
      return {
        visibleComponents: currentVisibleComponents
      };
    });
  };
  
  const getVisibleComponentIds = (): string[] => {
    return visibilityConfig.visibleComponents;
  };
  
  return { 
    visibilityConfig, 
    saveVisibilityConfig, 
    toggleComponentVisibility,
    getVisibleComponentIds,
    isLoaded: true
  };
}
```

### 3. Refactor `SetupScreen.tsx`

Replace localStorage handling with usePersistentState:

```typescript
// Import the usePersistentState hook
import { usePersistentState } from '../hooks/usePersistentState';

// Replace this code:
const initialTimerState = useMemo(() => getInitialTimerState(), []);
const [mode, setMode] = useState<'fixed' | 'per-participant'>(initialTimerState.mode);
const [totalDuration, setTotalDuration] = useState<number>(initialTimerState.totalDuration);
const [perParticipant, setPerParticipant] = useState<number>(initialTimerState.perParticipant);
const [allowExtension, setAllowExtension] = useState<boolean>(initialTimerState.allowExtension);
const [extensionAmount, setExtensionAmount] = useState<number>(initialTimerState.extensionAmount);

// Remove the useEffect that saves to localStorage

// With this code:
const [timerState, setTimerState] = usePersistentState(
  'timerSetupConfig',
  {
    mode: 'per-participant' as const,
    totalDurationMinutes: 15,
    durationPerParticipantSeconds: 60,
    allowExtension: false,
    extensionAmountSeconds: 60
  },
  {
    migrate: (legacyData) => ({
      mode: legacyData.mode === 'fixed' || legacyData.mode === 'per-participant' 
          ? legacyData.mode 
          : 'per-participant',
      totalDurationMinutes: typeof legacyData.totalDurationMinutes === 'number' 
          ? legacyData.totalDurationMinutes 
          : 15,
      durationPerParticipantSeconds: typeof legacyData.durationPerParticipantSeconds === 'number' 
          ? legacyData.durationPerParticipantSeconds 
          : typeof legacyData.perParticipantMinutes === 'number' 
          ? legacyData.perParticipantMinutes * 60 
          : 60,
      allowExtension: typeof legacyData.allowExtension === 'boolean' 
          ? legacyData.allowExtension 
          : false,
      extensionAmountSeconds: typeof legacyData.extensionAmountSeconds === 'number' 
          ? legacyData.extensionAmountSeconds 
          : typeof legacyData.extensionAmountMinutes === 'number' 
          ? legacyData.extensionAmountMinutes * 60 
          : 60
    })
  }
);

// Then use timerState.mode, timerState.totalDurationMinutes, etc.
// And update with setTimerState(prev => ({ ...prev, mode: 'fixed' }))
```

## ✅ Testing Strategy

1. **Unit Tests for Base Service**:
   - Test `storageService.get()` with valid and invalid JSON

2.  **Component Tests**:
    *   Test that components correctly initialize from storage services
    *   Test that components correctly save to storage services
    *   Test component behavior when storage operations fail
    *   Verify components no longer access localStorage directly

3.  **Integration Tests**:
    *   Test persistence between component unmounts/remounts
    *   Test data format migrations
    *   Test behavior when localStorage is unavailable
    *   Test behavior when localStorage quota is exceeded
    *   Verify end-to-end data flow through the storage services

4.  **Migration Tests**:
    *   Test backward compatibility with legacy localStorage formats
    *   Verify data integrity during migration
    *   Test fallback to defaults when legacy data cannot be migrated
    *   Test that changes in one component are reflected in another when using the same key

## 🔄 Migration Strategy

1. Implement new services and hooks without modifying existing code
2. Refactor one component at a time to use the new architecture
3. Add data migration logic to handle existing stored formats
4. Run thorough testing after each component migration
5. Remove deprecated code after all components are migrated
6. Update tests to reflect the new architecture

## 🧹 Cleanup Phase

**Status: COMPLETED ✅**

The following cleanup tasks have been completed:

1. **Removed direct localStorage access**
   - All components now use appropriate storage services
   - No direct localStorage.getItem/setItem calls remain in components
   - The only direct localStorage access is encapsulated in the base storageService

2. **Cleaned up legacy code**
   - Removed helper functions for parsing/serializing localStorage data
   - Deleted duplicate validation logic that has been moved to the storage services
   - Removed redundant localStorage key constants from components

3. **Standardized implementation**
   - Ensured all components use the same pattern for state persistence
   - Eliminated component-specific workarounds with the new architecture
   - Used consistent patterns for error handling across all components

4. **Removed excessive logging**
   - Cleaned up verbose console.logs related to localStorage operations
   - Maintained essential error logging for debugging purposes
   - Added more focused and helpful log messages

5. **Refactored remaining hooks**
   - Updated useLayoutStorage to use the new layoutStorageService
   - Ensured all hooks follow consistent patterns
   - Removed redundant code and simplified implementations

6. **Updated documentation**
   - This document now reflects the completed implementation
   - Added details about all implemented storage services
   - Updated testing and migration sections

This cleanup phase ensures the codebase remains maintainable and prevents developers from accidentally using the old patterns in new code.

## 📊 Expected Benefits

1. **DRY Code**: Eliminate repetitive localStorage access patterns
2. **Error Resilience**: Centralized error handling prevents silent failures
3. **Type Safety**: Better TypeScript integration with validation
4. **Testability**: Easier to mock for unit testing
5. **Future-Proofing**: Easy to switch to other storage mechanisms

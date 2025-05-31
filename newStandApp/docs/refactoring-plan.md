# Refactoring Plan: Modular State Persistence Architecture

## Background

As part of our initiative to implement a modular and robust state persistence architecture, we've already created a foundation of services and utilities:

- Core `storageService` for managing localStorage access
- Type-specific storage services for different data types
- A centralized `meetingSettingsService` that acts as a facade
- Refactored `useComponentVisibility` hook and `TopBarMeetingButton` component

This document outlines the comprehensive plan to complete the migration of remaining components from direct localStorage access to our new architecture.

## Components Requiring Refactoring

Based on code analysis, the following components still use direct localStorage access:

1. **KickoffScreen.tsx**
2. **Participants.tsx**
3. **TimerSetup.tsx**
4. **SetupScreen.tsx**

## Implementation Plan

### Phase 1: Core Components

#### 1. KickoffScreen Component

**Current Implementation:**
- Uses `KICKOFF_SETTING_KEY` constant for localStorage access
- Manual JSON serialization/deserialization
- No consistent error handling or validation

**Refactoring Steps:**
1. Import `kickoffSettingsStorageService` or `useMeetingSettings` hook
2. Replace direct localStorage access with service methods:
   ```typescript
   // Old approach
   const getInitialKickoffSettings = () => {
     try {
       const storedSettings = localStorage.getItem(KICKOFF_SETTING_KEY);
       // parsing logic...
     } catch (e) {
       // error handling...
     }
   };
   
   // New approach
   const initialKickoffSettings = kickoffSettingsStorageService.getKickoffSettings();
   ```
3. Replace save logic with service calls:
   ```typescript
   // Old approach
   localStorage.setItem(KICKOFF_SETTING_KEY, JSON.stringify(settingsToSave));
   
   // New approach
   kickoffSettingsStorageService.saveKickoffSettings(settingsToSave);
   ```

#### 2. Participants Component

**Current Implementation:**
- Uses separate keys for participants list and visibility mode
- Duplicated localStorage logic
- Inline error handling

**Refactoring Steps:**
1. Import appropriate storage services or `useMeetingSettings` hook
2. Replace participant list retrieval:
   ```typescript
   // Old approach
   const stored = localStorage.getItem(localStorageKey);
   const initialParticipants = /* parsing logic */
   
   // New approach
   const initialParticipants = participantsStorageService.getParticipants();
   ```
3. Replace visibility mode retrieval:
   ```typescript
   // Old approach
   const storedMode = localStorage.getItem(PARTICIPANT_LIST_VISIBILITY_KEY);
   
   // New approach
   const initialMode = participantListVisibilityStorageService.getVisibilityMode();
   ```
4. Update save logic for both data types

### Phase 2: Setup Components

#### 3. TimerSetup & 4. SetupScreen Components

**Current Implementation:**
- Both components use similar localStorage patterns
- Duplicated code between components
- Manual error handling and default values

**Refactoring Steps:**
1. Import `timerConfigStorageService` or `useMeetingSettings` hook
2. Replace timer config retrieval:
   ```typescript
   // Old approach
   const raw = localStorage.getItem(TIMER_SETUP_STORAGE_KEY);
   // parsing and error handling...
   
   // New approach
   const initialConfig = timerConfigStorageService.getTimerConfig();
   ```
3. Update save logic:
   ```typescript
   // Old approach
   localStorage.setItem(TIMER_SETUP_STORAGE_KEY, JSON.stringify(config));
   
   // New approach
   timerConfigStorageService.saveTimerConfig(config);
   ```
4. Consider consolidating common code between these components

### Phase 3: Custom Hooks & Testing (Optional Enhancement)

For components with complex state management, create custom hooks that wrap storage services:

#### 1. Component-Specific Custom Hooks

Example:
```typescript
export function useKickoffSettings() {
  const [settings, setSettings] = useState(
    kickoffSettingsStorageService.getKickoffSettings()
  );
  
  const updateSettings = useCallback((newSettings) => {
    const success = kickoffSettingsStorageService.saveKickoffSettings(newSettings);
    if (success) {
      setSettings(newSettings);
    }
    return success;
  }, []);
  
  return { settings, updateSettings };
}
```

#### 2. Testing Updates

1. Update E2E tests to work with the new architecture
2. Add unit tests for the new hooks
3. Test error scenarios and data validation

## Technical Approach

### Error Handling

All components should leverage the consistent error handling provided by storage services:

```typescript
try {
  const result = someStorageService.getSomeData();
  // If we get here, the operation succeeded
} catch (error) {
  // Handle specific error cases if needed
  console.error('Failed to load data:', error);
  // Use fallback values or show error UI
}
```

### Data Validation

Storage services include validation for all data structures. Components should:

1. Trust the data returned from storage services
2. Handle the possibility of default values being returned if validation fails
3. Not implement redundant validation logic

### Migration Support

Our storage services already handle data format migration. Components should:

1. Remove any legacy migration code
2. Rely on storage services to handle different data formats

## Implementation Sequence

1. **KickoffScreen** - High priority due to its role in the meeting flow
2. **Participants** - Deals with user data that needs validation
3. **TimerSetup & SetupScreen** - Related components to be updated together

## Success Criteria

The refactoring will be considered successful when:

1. All direct localStorage access is replaced with storage service calls
2. Components focus on UI and state management, not persistence details
3. Error handling is consistent across the application
4. Tests pass with the new implementation
5. No regressions in existing functionality

## Conclusion

This refactoring plan provides a structured approach to completing our modular state persistence architecture. By methodically updating each component, we'll improve code quality, maintenance, and error handling while ensuring backward compatibility.

## Appendix: Related Files

- `/src/services/storageService.ts` - Core storage abstraction
- `/src/services/timerConfigStorageService.ts` - Timer configuration persistence
- `/src/services/participantsStorageService.ts` - Participants data persistence
- `/src/services/kickoffSettingsStorageService.ts` - Kickoff settings persistence
- `/src/services/componentVisibilityStorageService.ts` - Component visibility settings
- `/src/services/participantListVisibilityStorageService.ts` - Participant list visibility
- `/src/services/meetingSettingsService.ts` - Centralized meeting settings facade
- `/src/hooks/usePersistentState.ts` - Generic hook for persistent state
- `/src/hooks/useComponentVisibility.ts` - Hook for component visibility (already refactored)
- `/src/hooks/useMeetingSettings.ts` - Comprehensive hook for all meeting settings

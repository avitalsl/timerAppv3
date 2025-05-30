import React, { createContext, useReducer, useContext, type ReactNode, type Dispatch } from 'react';

// --- Interfaces ---
export interface KickoffSetting {
  mode: 'getDownToBusiness' | 'storyTime';
  storyOption: 'random' | 'manual' | null;
}

export interface Participant {
  name: string;
  included: boolean;
  // Add other participant-specific fields if needed in the future
}

// Raw config loaded from localStorage (TimerSetup.tsx)
export interface StoredTimerConfig {
  mode: 'fixed' | 'per-participant';
  totalDurationMinutes?: number;
  perParticipantMinutes?: number;      // Kept for potential legacy use or different setup paths
  durationPerParticipantSeconds?: number; // Added for direct seconds input
  allowExtension: boolean;
  extensionAmountMinutes?: number;     // Kept for backward compatibility
  extensionAmountSeconds?: number;     // Added for direct seconds input
}

// Processed config for use in context
interface MeetingTimerConfig {
  mode: 'fixed' | 'per-participant';
  durationSeconds: number; // Either total or per participant
  allowExtension: boolean;
  extensionAmountSeconds?: number;
}

// --- State --- 
export interface MeetingState {
  isMeetingActive: boolean;
  timerConfig: MeetingTimerConfig | null;
  kickoffSettings: KickoffSetting | null;
  participants: Participant[]; // Only included participants
  currentParticipantIndex: number | null;
  currentTimeSeconds: number;
  timerStatus: 'idle' | 'running' | 'paused' | 'finished' | 'participant_transition';
  selectedGridComponentIds: string[];
  participantListVisibilityMode: 'all_visible' | 'focus_speaker';
}

const initialState: MeetingState = {
  isMeetingActive: false,
  timerConfig: null,
  kickoffSettings: null,
  participants: [],
  currentParticipantIndex: null,
  currentTimeSeconds: 0,
  timerStatus: 'idle',
  selectedGridComponentIds: [],
  participantListVisibilityMode: 'all_visible',
};

// --- Actions --- 
export type MeetingAction = 
  | { type: 'START_MEETING'; payload: { storedTimerConfig: StoredTimerConfig; participants: Participant[]; kickoffSettings: KickoffSetting; selectedGridComponentIds: string[]; participantListVisibilityMode: 'all_visible' | 'focus_speaker' } }
  | { type: 'END_MEETING' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESUME_TIMER' }
  | { type: 'TICK' }
  | { type: 'NEXT_PARTICIPANT' }
  | { type: 'ADD_TIME' }
  | { type: 'SET_TIMER_STATUS'; payload: MeetingState['timerStatus'] };

// --- Reducer --- 
const meetingReducer = (state: MeetingState, action: MeetingAction): MeetingState => {
  switch (action.type) {
    case 'START_MEETING':
      // Debug: Log the full payload and the participantListVisibilityMode
      console.log('[DEBUG] START_MEETING payload:', action.payload);
      console.log('[DEBUG] participantListVisibilityMode:', action.payload.participantListVisibilityMode);
      // Logic to process StoredTimerConfig and initialize state
      // This will be fleshed out more when we implement useMeetingTimer
      const { storedTimerConfig, participants, kickoffSettings, selectedGridComponentIds, participantListVisibilityMode } = action.payload;
      const mode = storedTimerConfig.mode;
      let durationSeconds = 0;
      if (mode === 'fixed' && storedTimerConfig.totalDurationMinutes) {
        durationSeconds = storedTimerConfig.totalDurationMinutes * 60;
      } else if (mode === 'per-participant') {
        if (typeof storedTimerConfig.durationPerParticipantSeconds === 'number') {
          durationSeconds = storedTimerConfig.durationPerParticipantSeconds;
        } else if (typeof storedTimerConfig.perParticipantMinutes === 'number') {
          durationSeconds = storedTimerConfig.perParticipantMinutes * 60;
        }
        // If neither is provided, durationSeconds remains 0, which is a fallback. Consider logging a warning.
        if (durationSeconds === 0) {
          console.warn('[MeetingContext] Per-participant mode selected but no duration (durationPerParticipantSeconds or perParticipantMinutes) was provided in StoredTimerConfig.');
        }
      }

      const activeParticipants = participants.filter(p => p.included);

      return {
        ...initialState, // Reset to initial state first
        isMeetingActive: true,
        timerConfig: {
          mode: mode,
          durationSeconds: durationSeconds,
          allowExtension: storedTimerConfig.allowExtension,
          extensionAmountSeconds: storedTimerConfig.extensionAmountSeconds !== undefined ? storedTimerConfig.extensionAmountSeconds : 
                                 storedTimerConfig.extensionAmountMinutes ? storedTimerConfig.extensionAmountMinutes * 60 : undefined,
        },
        kickoffSettings: kickoffSettings,
        selectedGridComponentIds: selectedGridComponentIds,
        participants: activeParticipants,
        currentParticipantIndex: mode === 'per-participant' && activeParticipants.length > 0 ? 0 : null,
        currentTimeSeconds: durationSeconds,
        timerStatus: 'running',
        participantListVisibilityMode: participantListVisibilityMode || 'all_visible', // Fallback just in case
      };
      let calculatedExtensionSeconds: number | undefined = undefined;
      if (storedTimerConfig && storedTimerConfig.extensionAmountSeconds !== undefined) {
        calculatedExtensionSeconds = storedTimerConfig.extensionAmountSeconds;
      } else if (storedTimerConfig && storedTimerConfig.extensionAmountMinutes !== undefined) {
        // If extensionAmountMinutes is not undefined, its type (number | undefined) narrows to number.
        // Asserting as number due to persistent linter issue with type narrowing.
        calculatedExtensionSeconds = (storedTimerConfig.extensionAmountMinutes as number) * 60;
      }

      const newTimerConfig: MeetingTimerConfig = {
        mode: mode,
        durationSeconds: durationSeconds,
        allowExtension: storedTimerConfig.allowExtension,
        extensionAmountSeconds: calculatedExtensionSeconds,
      };

      const newState: MeetingState = {
        ...initialState,
        isMeetingActive: true,
        timerConfig: newTimerConfig,
        kickoffSettings: kickoffSettings,
        selectedGridComponentIds: selectedGridComponentIds,
        participants: activeParticipants,
        currentParticipantIndex: mode === 'per-participant' && activeParticipants.length > 0 ? 0 : null,
        currentTimeSeconds: durationSeconds,
        timerStatus: 'running', // This is a valid MeetingState['timerStatus']
        participantListVisibilityMode: participantListVisibilityMode || 'all_visible',
      };
      return newState;
    case 'END_MEETING':
      console.log('[MeetingContext] END_MEETING');
      return { ...initialState, selectedGridComponentIds: [] }; // Reset to initial state, ensuring selectedGridComponentIds is also reset
    case 'PAUSE_TIMER':
      if (!state.isMeetingActive || state.timerStatus !== 'running') return state;
      console.log('[MeetingContext] PAUSE_TIMER');
      return { ...state, timerStatus: 'paused' };
    case 'RESUME_TIMER':
      if (!state.isMeetingActive || state.timerStatus !== 'paused') return state;
      console.log('[MeetingContext] RESUME_TIMER');
      return { ...state, timerStatus: 'running' };
    case 'TICK':
      // This will be driven by useMeetingTimer hook
      // console.log('[MeetingContext] TICK');
      if (!state.isMeetingActive || state.timerStatus !== 'running' || state.currentTimeSeconds <= 0) return state;
      return { ...state, currentTimeSeconds: state.currentTimeSeconds - 1 };
    case 'NEXT_PARTICIPANT':
      // Logic for 'per-participant' mode, driven by useMeetingTimer or TimerWidget
      console.log('[MeetingContext] NEXT_PARTICIPANT');
      if (state.timerConfig?.mode === 'per-participant' && state.currentParticipantIndex !== null) {
        const nextIndex = state.currentParticipantIndex + 1;
        if (nextIndex < state.participants.length) {
          console.log('[MeetingContext] NEXT_PARTICIPANT: Resetting currentTimeSeconds to', state.timerConfig?.durationSeconds, 'for participant index', nextIndex);
          return {
            ...state,
            currentParticipantIndex: nextIndex,
            currentTimeSeconds: state.timerConfig?.durationSeconds, // Reset time for next participant
            timerStatus: 'running',
          };
        } else {
          // Last participant finished
          return { ...state, timerStatus: 'finished', isMeetingActive: false }; // Or a specific 'all_participants_finished' status
        }
      }
      return state;
    case 'SET_TIMER_STATUS':
      return { ...state, timerStatus: action.payload };
    case 'ADD_TIME':
      // Only add time if the meeting is active and the timer config allows extension
      if (!state.isMeetingActive || !state.timerConfig?.allowExtension || !state.timerConfig?.extensionAmountSeconds) {
        return state;
      }
      console.log('[MeetingContext] ADD_TIME: Adding', state.timerConfig.extensionAmountSeconds, 'seconds to timer');
      return {
        ...state,
        currentTimeSeconds: state.currentTimeSeconds + state.timerConfig.extensionAmountSeconds
      };
    default:
      return state;
  }
};

// --- Context Object ---
interface MeetingContextType {
  state: MeetingState;
  dispatch: Dispatch<MeetingAction>;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

// --- Provider Component ---
interface MeetingProviderProps {
  children: ReactNode;
}

import { useMeetingTimer } from '../hooks/useMeetingTimer'; // Added import

// ... (rest of the existing imports and code before MeetingProvider)

export const MeetingProvider: React.FC<MeetingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(meetingReducer, initialState);
  
  // Call the hook here. It doesn't return anything, but sets up the timer side effects.
  // However, useMeetingTimer itself uses useMeeting, which would create a circular dependency
  // or an issue if called directly within the provider that creates the context instance.
  // A better approach is to have a small internal component that uses the hook.

  return (
    <MeetingContext.Provider value={{ state, dispatch }}>
      <MeetingTimerInitializer /> {/* This component will call useMeetingTimer */}
      {children}
    </MeetingContext.Provider>
  );
};

// Small internal component to safely call the hook after context is established
const MeetingTimerInitializer: React.FC = () => {
  useMeetingTimer(); // Initialize timer logic
  return null; // This component does not render anything
};

// --- Hook to use context ---
// ... (rest of the existing code after MeetingProvider)

// --- Hook to use context ---
export const useMeeting = (): MeetingContextType => {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
};

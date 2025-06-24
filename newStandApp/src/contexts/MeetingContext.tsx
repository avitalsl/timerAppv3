import React, { createContext, useReducer, useContext, type ReactNode, type Dispatch } from 'react';
import { ComponentType } from '../types/layoutTypes'; // Added import for ComponentType
import { meetingTimerService } from '../services/meetingTimerService'; // Import the service

// --- Interfaces ---
export interface KickoffSetting {
  mode: 'getDownToBusiness' | 'storyTime';
  storyOption: 'random' | 'manual' | null;
  storyDurationSeconds: number | undefined;
  storytellerName: string;
}

// Define participant status as a string type 
export type ParticipantStatus = 'PENDING' | 'ACTIVE' | 'FINISHED' | 'SKIPPED';

// Create a const object with the same name to maintain API compatibility
export const ParticipantStatus = {
  PENDING: 'PENDING',    // Not yet spoken
  ACTIVE: 'ACTIVE',      // Currently speaking
  FINISHED: 'FINISHED',  // Completed their turn
  SKIPPED: 'SKIPPED',    // Skipped by moderator
} as const;

export interface Participant {
  id: string;            // Unique identifier for the participant
  name: string;
  included: boolean;
  // Time management fields
  allocatedTimeSeconds: number;    // Initially allocated time
  remainingTimeSeconds: number;    // Current remaining time
  usedTimeSeconds: number;         // Total time used so far
  // Status fields
  status: ParticipantStatus;       // Current speaking status
  hasSpeakerRole: boolean;         // Whether this participant has the speaker role
  // User type and authentication fields
  type: 'interactive' | 'viewOnly'; // Type of participant
  email?: string;                  // Email address for interactive participants
  userId?: string;                 // User ID for interactive participants
}

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
export interface MeetingTimerConfig {
  mode: 'fixed' | 'per-participant';
  durationSeconds: number; // Either total or per participant
  allowExtension: boolean;
  extensionAmountSeconds?: number;
}

// --- State --- 
export interface MeetingState {
  isMeetingActive: boolean;
  isMeetingUIVisible: boolean; // Added to manage UI visibility
  timerConfig: MeetingTimerConfig | null;
  kickoffSettings: KickoffSetting | null;
  participants: Participant[]; // Only included participants
  currentParticipantIndex: number | null;
  currentTimeSeconds: number;
  timerStatus: 'idle' | 'running' | 'paused' | 'finished' | 'participant_transition';
  selectedGridComponentIds: string[];
  participantListVisibilityMode: 'all_visible' | 'focus_speaker';
  // New fields for time donation feature
  currentSpeakerId: string | null; // ID of the current speaker (more robust than index)
  speakerQueue: string[];          // IDs of participants in the queue
  meetingStatus: 'NotStarted' | 'InProgress' | 'Finished'; // Overall meeting status
}

const initialState: MeetingState = {
  isMeetingActive: false,
  isMeetingUIVisible: false, // Initialized
  timerConfig: null,
  kickoffSettings: null,
  participants: [],
  currentParticipantIndex: null,
  currentTimeSeconds: 0,
  timerStatus: 'idle',
  selectedGridComponentIds: [],
  participantListVisibilityMode: 'all_visible',
  // Initialize new fields
  currentSpeakerId: null,
  speakerQueue: [],
  meetingStatus: 'NotStarted'
};

// --- Actions --- 
export type MeetingAction = 
  | { type: 'START_MEETING'; payload: { storedTimerConfig: StoredTimerConfig; participants: Participant[]; kickoffSettings: KickoffSetting; selectedGridComponentIds: string[]; participantListVisibilityMode: 'all_visible' | 'focus_speaker' } }
  | { type: 'END_MEETING' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESUME_TIMER' }
  | { type: 'TICK'; payload?: { elapsedSeconds: number } } // Optional payload for elapsed time
  | { type: 'NEXT_PARTICIPANT' }
  | { type: 'SET_NEXT_SPEAKER'; payload: { participantId: string } } // New action to set a specific speaker
  | { type: 'SKIP_PARTICIPANT'; payload: { participantId: string } } // New action to skip a participant
  | { type: 'DONATE_TIME'; payload: { fromParticipantId: string } } // New action for time donation
  | { type: 'CUSTOMIZE_PARTICIPANT_TIME'; payload: { participantId: string; timeSeconds: number } } // New action to customize participant time
  | { type: 'ADD_TIME' }
  | { type: 'SET_TIMER_STATUS'; payload: MeetingState['timerStatus'] }
  | { type: 'UPDATE_SELECTED_COMPONENTS'; payload: string[] }
  | { type: 'REMOVE_COMPONENT_FROM_GRID'; payload: string };

// --- Reducer --- 
const meetingReducer = (state: MeetingState, action: MeetingAction): MeetingState => {
  switch (action.type) {
    case 'START_MEETING': {
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

      // Conditionally add StoryWidget if mode is 'storyTime'
      const finalSelectedGridComponentIds = [...selectedGridComponentIds]; // Use the one from action.payload
      if (kickoffSettings?.mode === 'storyTime' && !finalSelectedGridComponentIds.includes(ComponentType.STORY)) {
        finalSelectedGridComponentIds.push(ComponentType.STORY);
      }

      return {
        ...initialState, // Reset to initial state first
        isMeetingActive: true,
        isMeetingUIVisible: true, // Set UI to visible when meeting starts
        timerConfig: {
          mode: mode,
          durationSeconds: durationSeconds,
          allowExtension: storedTimerConfig.allowExtension,
          extensionAmountSeconds: storedTimerConfig.extensionAmountSeconds !== undefined ? storedTimerConfig.extensionAmountSeconds : 
                                 storedTimerConfig.extensionAmountMinutes ? storedTimerConfig.extensionAmountMinutes * 60 : undefined,
        },
        kickoffSettings: kickoffSettings,
        participants: activeParticipants,
        currentParticipantIndex: mode === 'per-participant' && activeParticipants.length > 0 ? 0 : null,
        currentTimeSeconds: durationSeconds,
        timerStatus: 'running',
        selectedGridComponentIds: finalSelectedGridComponentIds, // Use the potentially modified list
        participantListVisibilityMode: participantListVisibilityMode ?? 'all_visible',
        // Initialize new fields
        currentSpeakerId: null,
        speakerQueue: [],
        meetingStatus: 'InProgress'
      };
    }
    case 'END_MEETING':
      console.log('[MeetingContext] END_MEETING');
      return { ...initialState, selectedGridComponentIds: [], meetingStatus: 'Finished' }; // Reset to initial state, isMeetingUIVisible will be false
    case 'PAUSE_TIMER':
      if (!state.isMeetingActive || state.timerStatus !== 'running') return state;
      console.log('[MeetingContext] PAUSE_TIMER');
      return { ...state, timerStatus: 'paused' };
    case 'RESUME_TIMER':
      if (!state.isMeetingActive || state.timerStatus !== 'paused') return state;
      console.log('[MeetingContext] RESUME_TIMER');
      return { ...state, timerStatus: 'running' };
    case 'TICK':
      // Use the processTick function from the service
      const elapsedSeconds = action.payload?.elapsedSeconds ?? 1;
      return meetingTimerService.processTick(state, elapsedSeconds);
    case 'NEXT_PARTICIPANT':
      // Logic for 'per-participant' mode, driven by useMeetingTimer or TimerWidget
      console.log('[MeetingContext] NEXT_PARTICIPANT');
      if (state.timerConfig?.mode === 'per-participant' && state.currentParticipantIndex !== null) {
        const nextIndex = state.currentParticipantIndex + 1;
        if (nextIndex < state.participants.length) {
          console.log('[MeetingContext] NEXT_PARTICIPANT: Resetting currentTimeSeconds to', state.timerConfig?.durationSeconds, 'for participant index', nextIndex);
          // Set the current speaker ID as well for the new participant
          const nextParticipant = state.participants[nextIndex];
          return {
            ...state,
            currentParticipantIndex: nextIndex,
            currentSpeakerId: nextParticipant.id,
            currentTimeSeconds: state.timerConfig?.durationSeconds, // Reset time for next participant
            timerStatus: 'running',
          };
        } else {
          // Last participant finished
          return { 
            ...state, 
            timerStatus: 'finished', 
            isMeetingActive: false, 
            meetingStatus: 'Finished'
          };
        }
      }
      return state;
    case 'SET_NEXT_SPEAKER':
      // Use the service to get speaker by ID rather than index
      return {
        ...state, 
        currentSpeakerId: action.payload.participantId,
        // Update the speaker queue
        speakerQueue: [
          ...state.speakerQueue.filter(id => id !== action.payload.participantId),
          action.payload.participantId
        ]
      };
    case 'SKIP_PARTICIPANT':
      // Use the skipParticipant function from the service
      return meetingTimerService.skipParticipant(state, action.payload.participantId);
    case 'DONATE_TIME':
      // Use the donateTime function from the service
      // Since donateTime now returns the complete updated state or original state on failure
      return meetingTimerService.donateTime(
        state,
        action.payload.fromParticipantId
      );
    case 'CUSTOMIZE_PARTICIPANT_TIME':
      // Update the participant's time
      const participantId = action.payload.participantId;
      const participantIndex = state.participants.findIndex(p => p.id === participantId);
      if (participantIndex !== -1) {
        // Create a copy of the participants array and update the specific participant
        const updatedParticipants = [...state.participants];
        updatedParticipants[participantIndex] = {
          ...updatedParticipants[participantIndex],
          allocatedTimeSeconds: action.payload.timeSeconds,
          remainingTimeSeconds: action.payload.timeSeconds
        };
        return {
          ...state,
          participants: updatedParticipants
        };
      }
      return state;
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
    case 'SET_TIMER_STATUS':
      return { ...state, timerStatus: action.payload };
    case 'UPDATE_SELECTED_COMPONENTS':
      console.log('[MeetingContext] UPDATE_SELECTED_COMPONENTS:', action.payload);
      return {
        ...state,
        selectedGridComponentIds: action.payload
      };
    case 'REMOVE_COMPONENT_FROM_GRID':
      return {
        ...state,
        selectedGridComponentIds: state.selectedGridComponentIds.filter(
          id => id !== action.payload
        ),
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

import { useEffect, useRef } from 'react';
import { useMeeting } from '../contexts/MeetingContext';

/**
 * Custom hook to manage the meeting timer logic, including countdown,
 * participant transitions, and meeting completion.
 */
export const useMeetingTimer = () => {
  const { state, dispatch } = useMeeting();
  const { 
    isMeetingActive,
    timerStatus,
    currentTimeSeconds,
    timerConfig,
    currentParticipantIndex,
    participants 
  } = state;

  // Use a ref for the interval ID to ensure it's stable across re-renders
  // and can be accessed in the cleanup function of useEffect.
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval when dependencies change or component unmounts
    const clearTimerInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (isMeetingActive && timerStatus === 'running') {
      // Start a new interval
      intervalRef.current = setInterval(() => {
        if (currentTimeSeconds > 0) {
          dispatch({ type: 'TICK', payload: { elapsedSeconds: 1 } });
        } else {
          // Time has reached 0
          clearTimerInterval(); // Stop the current timer before transitioning

          if (timerConfig?.mode === 'per-participant') {
            if (currentParticipantIndex !== null && currentParticipantIndex < participants.length - 1) {
              // console.log('[useMeetingTimer] Time up for participant, moving to next.');
              dispatch({ type: 'NEXT_PARTICIPANT' });
            } else {
              // Last participant finished or no participants
              // console.log('[useMeetingTimer] All participants finished.');
              dispatch({ type: 'SET_TIMER_STATUS', payload: 'finished' });
              // Consider dispatch({ type: 'END_MEETING' }) if immediate reset is desired
            }
          } else if (timerConfig?.mode === 'fixed') {
            // Fixed meeting time ended
            // console.log('[useMeetingTimer] Fixed meeting time finished.');
            dispatch({ type: 'SET_TIMER_STATUS', payload: 'finished' });
            // Consider dispatch({ type: 'END_MEETING' })
          } else {
            // Should not happen if timerConfig is set correctly
            // console.log('[useMeetingTimer] Timer ended but mode is unclear.');
            dispatch({ type: 'SET_TIMER_STATUS', payload: 'finished' });
          }
        }
      }, 1000);
    } else {
      // If not active or not running, ensure interval is cleared
      clearTimerInterval();
    }

    // Cleanup function to clear interval when component unmounts or dependencies change
    return clearTimerInterval;

  }, [isMeetingActive, timerStatus, currentTimeSeconds, timerConfig, currentParticipantIndex, participants, dispatch]);

  // This hook does not return anything as it only performs side effects.
  // Components will consume MeetingContext directly for state.
};

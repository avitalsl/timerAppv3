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
    currentSpeakerId,    // ← שימוש חדש!
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
            const currentIdx = participants.findIndex(p => p.id === currentSpeakerId);
            if (currentIdx !== -1 && currentIdx < participants.length - 1) {
              dispatch({ type: 'NEXT_PARTICIPANT' });
            } else {
              dispatch({ type: 'SET_TIMER_STATUS', payload: 'finished' });
            }
          } else if (timerConfig?.mode === 'fixed') {
            dispatch({ type: 'SET_TIMER_STATUS', payload: 'finished' });
          } else {
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

  }, [isMeetingActive, timerStatus, currentTimeSeconds, timerConfig, currentSpeakerId, participants, dispatch]);
};
import React, { useEffect, useState, useCallback } from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import { ComponentType } from '../../types/layoutTypes';

/**
 * StoryWidget component.
 * Displays storyteller information and manages its own removal after a set duration or manual end.
 */
const StoryWidget: React.FC = () => {
  const { state, dispatch } = useMeeting();
  const { kickoffSettings } = state;

  const storyDuration = kickoffSettings?.storyDurationSeconds ?? 0;
  const storytellerName = kickoffSettings?.storytellerName || 'The Storyteller';

  const [remainingTime, setRemainingTime] = useState(storyDuration);

  const handleEndStoryTime = useCallback(() => {
    dispatch({ type: 'REMOVE_COMPONENT_FROM_GRID', payload: ComponentType.STORY });
  }, [dispatch]);

  useEffect(() => {
    if (remainingTime <= 0) {
      handleEndStoryTime();
      return;
    }

    const timerId = setInterval(() => {
      setRemainingTime(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [remainingTime, handleEndStoryTime]);

  if (!kickoffSettings || kickoffSettings.mode !== 'storyTime' || storyDuration <= 0) {
    // This case should ideally not happen if logic to add/remove widget is correct
    // but as a safeguard, remove if conditions aren't met.
    if (kickoffSettings) { // only dispatch if context is available
        // dispatch({ type: 'REMOVE_COMPONENT_FROM_GRID', payload: ComponentType.STORY });
        // Temporarily disabling auto-removal if conditions aren't met initially to avoid loops
        // This relies on the MeetingContext to correctly add this component only when appropriate.
    }
    return <p>Story time is not active or configured.</p>; 
  }

  return (
    <div data-testid="story-time-widget-container" style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h3 style={{ marginTop: 0 }}>Story Time!</h3>
      <p data-testid="story-teller-announcement">Storyteller: <strong>{storytellerName}</strong></p>
      <p data-testid="story-duration-display">Time remaining: {remainingTime} seconds</p>
      <button onClick={handleEndStoryTime} style={{ marginTop: '10px', padding: '8px 12px', cursor: 'pointer' }}>
        End Story Time
      </button>
    </div>
  );
};

export default StoryWidget;
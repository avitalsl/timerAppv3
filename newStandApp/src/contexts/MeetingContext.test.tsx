import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MeetingProvider, useMeeting, type StoredTimerConfig, type KickoffSetting } from './MeetingContext';
import React from 'react';

// A test component to interact with the context
const TestComponent = () => {
  const { state, dispatch } = useMeeting(); // FIX: Destructure 'state' instead of 'meetingState'

  // FIX: Create a valid payload for the START_MEETING action
  const mockStoredTimerConfig: StoredTimerConfig = {
    mode: 'fixed',
    totalDurationMinutes: 1,
    allowExtension: false,
  };

  const mockKickoffSettings: KickoffSetting = {
    mode: 'getDownToBusiness',
    storyOption: null,
    storyDurationSeconds: undefined,
    storytellerName: '',
  };

  const startMeetingPayload = {
    storedTimerConfig: mockStoredTimerConfig,
    participants: [],
    kickoffSettings: mockKickoffSettings,
    selectedGridComponentIds: [],
    participantListVisibilityMode: 'all_visible' as const,
  };

  return (
    <div>
      <div data-testid="visibility-state">
        {state.isMeetingUIVisible.toString()} {/* FIX: Use state.isMeetingUIVisible */}
      </div>
      <button onClick={() => dispatch({ type: 'START_MEETING', payload: startMeetingPayload })}>
        Start Meeting
      </button>
      <button onClick={() => dispatch({ type: 'END_MEETING' })}>
        End Meeting
      </button>
    </div>
  );
};

describe('MeetingContext', () => {
  it('should set isMeetingUIVisible to true on START_MEETING', () => {
    render(
      <MeetingProvider>
        <TestComponent />
      </MeetingProvider>
    );

    // Initially, the UI should not be visible
    expect(screen.getByTestId('visibility-state')).toHaveTextContent('false');

    // Click the start button
    fireEvent.click(screen.getByText('Start Meeting'));

    // Now, the UI should be visible
    expect(screen.getByTestId('visibility-state')).toHaveTextContent('true');
  });

  it('should set isMeetingUIVisible to false on END_MEETING', () => {
    render(
      <MeetingProvider>
        <TestComponent />
      </MeetingProvider>
    );

    // Start the meeting first to make the state true
    fireEvent.click(screen.getByText('Start Meeting'));
    expect(screen.getByTestId('visibility-state')).toHaveTextContent('true');

    // Click the end button
    fireEvent.click(screen.getByText('End Meeting'));

    // Now, the UI should be hidden again
    expect(screen.getByTestId('visibility-state')).toHaveTextContent('false');
  });
});

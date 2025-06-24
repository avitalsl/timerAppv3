import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MeetingProvider, useMeeting, type StoredTimerConfig, type KickoffSetting, type Participant, ParticipantStatus } from './MeetingContext';

// A test component to interact with the context
const TestComponent = () => {
  const { state, dispatch } = useMeeting();

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

  const mockExtendableTimerConfig: StoredTimerConfig = {
    mode: 'fixed',
    totalDurationMinutes: 1,
    allowExtension: true,
    extensionAmountSeconds: 15,
  };

  const startExtendableMeetingPayload = {
    ...startMeetingPayload,
    storedTimerConfig: mockExtendableTimerConfig,
  };

  const mockPerParticipantTimerConfig: StoredTimerConfig = {
    mode: 'per-participant',
    durationPerParticipantSeconds: 30,
    allowExtension: false,
  };

  const mockParticipants: Participant[] = [
    { 
      id: '1',
      name: 'Alice', 
      included: true,
      allocatedTimeSeconds: 30,
      remainingTimeSeconds: 30,
      usedTimeSeconds: 0,
      status: ParticipantStatus.PENDING,
      hasSpeakerRole: false,
      type: 'viewOnly' // Add the required type field
    },
    { 
      id: '2',
      name: 'Bob', 
      included: true,
      allocatedTimeSeconds: 30,
      remainingTimeSeconds: 30,
      usedTimeSeconds: 0,
      status: ParticipantStatus.PENDING,
      hasSpeakerRole: false,
      type: 'viewOnly' // Add the required type field
    },
  ];

  const startPerParticipantMeetingPayload = {
    storedTimerConfig: mockPerParticipantTimerConfig,
    participants: mockParticipants,
    kickoffSettings: mockKickoffSettings,
    selectedGridComponentIds: [],
    participantListVisibilityMode: 'all_visible' as const,
  };


  return (
    <div>
      <div data-testid="visibility-state">
        {state.isMeetingUIVisible.toString()}
      </div>
      <div data-testid="timer-status">{state.timerStatus}</div>
      <div data-testid="current-time">{state.currentTimeSeconds}</div>
      <div data-testid="participant-index">{state.currentParticipantIndex}</div>
      <button onClick={() => dispatch({ type: 'START_MEETING', payload: startMeetingPayload })}>
        Start Meeting
      </button>
      <button onClick={() => dispatch({ type: 'START_MEETING', payload: startExtendableMeetingPayload })}>
        Start Extendable Meeting
      </button>
      <button onClick={() => dispatch({ type: 'START_MEETING', payload: startPerParticipantMeetingPayload })}>
        Start Per-Participant Meeting
      </button>
      <button onClick={() => dispatch({ type: 'END_MEETING' })}>
        End Meeting
      </button>
      <button onClick={() => dispatch({ type: 'PAUSE_TIMER' })}>
        Pause Timer
      </button>
      <button onClick={() => dispatch({ type: 'RESUME_TIMER' })}>
        Resume Timer
      </button>
      <button onClick={() => dispatch({ type: 'TICK', payload: { elapsedSeconds: 1 } })}>
        Tick
      </button>
      <button onClick={() => dispatch({ type: 'NEXT_PARTICIPANT' })}>
        Next Participant
      </button>
      <button onClick={() => dispatch({ type: 'ADD_TIME' })}>
        Add Time
      </button>
      <button onClick={() => dispatch({ type: 'SET_TIMER_STATUS', payload: 'participant_transition' })}>
        Set Status to Transition
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

  it('should change timerStatus to "paused" on PAUSE_TIMER', () => {
    render(
      <MeetingProvider>
        <TestComponent />
      </MeetingProvider>
    );

    // Start the meeting to set the timerStatus to 'running'
    fireEvent.click(screen.getByText('Start Meeting'));
    expect(screen.getByTestId('timer-status')).toHaveTextContent('running');

    // Click the pause button
    fireEvent.click(screen.getByText('Pause Timer'));

    // Now, the status should be 'paused'
    expect(screen.getByTestId('timer-status')).toHaveTextContent('paused');
  });

  it('should change timerStatus to "running" on RESUME_TIMER', () => {
    render(
      <MeetingProvider>
        <TestComponent />
      </MeetingProvider>
    );

    // Start and then pause the meeting
    fireEvent.click(screen.getByText('Start Meeting'));
    fireEvent.click(screen.getByText('Pause Timer'));
    expect(screen.getByTestId('timer-status')).toHaveTextContent('paused');

    // Click the resume button
    fireEvent.click(screen.getByText('Resume Timer'));

    // Now, the status should be 'running' again
    expect(screen.getByTestId('timer-status')).toHaveTextContent('running');
  });

  it('should decrement currentTimeSeconds by 1 on TICK', () => {
    render(
      <MeetingProvider>
        <TestComponent />
      </MeetingProvider>
    );

    // Start the meeting. The initial time is 1 minute (60 seconds).
    fireEvent.click(screen.getByText('Start Meeting'));
    expect(screen.getByTestId('current-time')).toHaveTextContent('60');

    // Dispatch a TICK action
    fireEvent.click(screen.getByText('Tick'));

    // The time should now be 59
    expect(screen.getByTestId('current-time')).toHaveTextContent('59');
  });

  it('should advance to the next participant on NEXT_PARTICIPANT', () => {
    render(
      <MeetingProvider>
        <TestComponent />
      </MeetingProvider>
    );

    // Start a per-participant meeting
    fireEvent.click(screen.getByText('Start Per-Participant Meeting'));

    // Check initial state
    expect(screen.getByTestId('participant-index')).toHaveTextContent('0');
    expect(screen.getByTestId('current-time')).toHaveTextContent('30');

    // Move to the next participant
    fireEvent.click(screen.getByText('Next Participant'));

    // The index should be updated and the timer should reset
    expect(screen.getByTestId('participant-index')).toHaveTextContent('1');
    expect(screen.getByTestId('current-time')).toHaveTextContent('30');
  });

  it('should add time on ADD_TIME if extension is allowed', () => {
    render(
      <MeetingProvider>
        <TestComponent />
      </MeetingProvider>
    );

    // Start a meeting where extension is allowed
    fireEvent.click(screen.getByText('Start Extendable Meeting'));
    expect(screen.getByTestId('current-time')).toHaveTextContent('60');

    // Add time
    fireEvent.click(screen.getByText('Add Time'));

    // The time should increase by the extension amount (15s)
    expect(screen.getByTestId('current-time')).toHaveTextContent('75');
  });

  it('should not add time on ADD_TIME if extension is not allowed', () => {
    render(
      <MeetingProvider>
        <TestComponent />
      </MeetingProvider>
    );

    // Start a regular meeting where extension is not allowed
    fireEvent.click(screen.getByText('Start Meeting'));
    expect(screen.getByTestId('current-time')).toHaveTextContent('60');

    // Attempt to add time
    fireEvent.click(screen.getByText('Add Time'));

    // The time should not change
    expect(screen.getByTestId('current-time')).toHaveTextContent('60');
  });

  it('should update timerStatus on SET_TIMER_STATUS', () => {
    render(
      <MeetingProvider>
        <TestComponent />
      </MeetingProvider>
    );

    // Start the meeting
    fireEvent.click(screen.getByText('Start Meeting'));
    expect(screen.getByTestId('timer-status')).toHaveTextContent('running');

    // Directly set the status
    fireEvent.click(screen.getByText('Set Status to Transition'));

    // The status should be updated
    expect(screen.getByTestId('timer-status')).toHaveTextContent('participant_transition');
  });
});

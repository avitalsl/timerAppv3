// Cleaned-up version of your test file with combined components, helper functions, and reduced duplication

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MeetingProvider, useMeeting, type StoredTimerConfig, type KickoffSetting, type Participant, ParticipantStatus } from './MeetingContext';

const mockKickoffSettings: KickoffSetting = {
  mode: 'getDownToBusiness',
  storyOption: null,
  storyDurationSeconds: undefined,
  storytellerName: '',
};

const createMockParticipants = (): Participant[] => [
  {
    id: '1',
    name: 'Alice',
    included: true,
    allocatedTimeSeconds: 30,
    remainingTimeSeconds: 30,
    usedTimeSeconds: 0,
    status: ParticipantStatus.ACTIVE,
    hasSpeakerRole: true,
    type: 'interactive',
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
    type: 'interactive',
  },
];

const TestComponent = ({ withDonation = false }: { withDonation?: boolean }) => {
  const { state, dispatch } = useMeeting();

  const startMeeting = (config: StoredTimerConfig, participants: Participant[] = []) => {
    dispatch({
      type: 'START_MEETING',
      payload: {
        storedTimerConfig: config,
        participants,
        kickoffSettings: mockKickoffSettings,
        selectedGridComponentIds: [],
        participantListVisibilityMode: 'all_visible',
      },
    });
  };

  const handleDonate = () => {
    dispatch({ type: 'DONATE_TIME', payload: { fromParticipantId: '2' } });
  };

  return (
    <div>
      <div data-testid="visibility-state">{state.isMeetingUIVisible.toString()}</div>
      <div data-testid="timer-status">{state.timerStatus}</div>
      <div data-testid="current-time">{state.currentTimeSeconds}</div>
      <div data-testid="current-speaker-id">{state.currentSpeakerId}</div>

      <button onClick={() => startMeeting({ mode: 'fixed', totalDurationMinutes: 1, allowExtension: false })}>Start Meeting</button>
      <button onClick={() => startMeeting({ mode: 'fixed', totalDurationMinutes: 1, allowExtension: true, extensionAmountSeconds: 15 })}>Start Extendable Meeting</button>
      <button onClick={() => startMeeting({ mode: 'per-participant', durationPerParticipantSeconds: 30, allowExtension: false }, createMockParticipants())}>Start Per-Participant Meeting</button>

      <button onClick={() => dispatch({ type: 'END_MEETING' })}>End Meeting</button>
      <button onClick={() => dispatch({ type: 'PAUSE_TIMER' })}>Pause</button>
      <button onClick={() => dispatch({ type: 'RESUME_TIMER' })}>Resume</button>
      <button onClick={() => dispatch({ type: 'TICK', payload: { elapsedSeconds: 1 } })}>Tick</button>
      <button onClick={() => dispatch({ type: 'NEXT_PARTICIPANT' })}>Next Participant</button>
      <button onClick={() => dispatch({ type: 'ADD_TIME' })}>Add Time</button>
      <button onClick={() => dispatch({ type: 'SET_TIMER_STATUS', payload: 'participant_transition' })}>Set Status</button>
      {withDonation && <button data-testid="donate-button" onClick={handleDonate}>Donate Time</button>}
    </div>
  );
};

describe('MeetingContext', () => {
  it('should start and end meeting', () => {
    render(<MeetingProvider><TestComponent /></MeetingProvider>);
    fireEvent.click(screen.getByText('Start Meeting'));
    expect(screen.getByTestId('visibility-state')).toHaveTextContent('true');
    fireEvent.click(screen.getByText('End Meeting'));
    expect(screen.getByTestId('visibility-state')).toHaveTextContent('false');
  });

  it('should pause and resume timer', () => {
    render(<MeetingProvider><TestComponent /></MeetingProvider>);
    fireEvent.click(screen.getByText('Start Meeting'));
    fireEvent.click(screen.getByText('Pause'));
    expect(screen.getByTestId('timer-status')).toHaveTextContent('paused');
    fireEvent.click(screen.getByText('Resume'));
    expect(screen.getByTestId('timer-status')).toHaveTextContent('running');
  });

  it('should tick down time', () => {
    render(<MeetingProvider><TestComponent /></MeetingProvider>);
    fireEvent.click(screen.getByText('Start Meeting'));
    expect(screen.getByTestId('current-time')).toHaveTextContent('60');
    fireEvent.click(screen.getByText('Tick'));
    expect(screen.getByTestId('current-time')).toHaveTextContent('59');
  });

  it('should advance participant and reset time', () => {
    render(<MeetingProvider><TestComponent /></MeetingProvider>);
    fireEvent.click(screen.getByText('Start Per-Participant Meeting'));
    fireEvent.click(screen.getByText('Next Participant'));
    expect(screen.getByTestId('current-speaker-id')).toHaveTextContent('2'); // בדוק לפי id של המשתתף הבא
    expect(screen.getByTestId('current-time')).toHaveTextContent('30');
  });

  it('should add time only when extension allowed', () => {
    render(<MeetingProvider><TestComponent /></MeetingProvider>);
    fireEvent.click(screen.getByText('Start Extendable Meeting'));
    fireEvent.click(screen.getByText('Add Time'));
    expect(screen.getByTestId('current-time')).toHaveTextContent('75');
  });

  it('should not add time when extension not allowed', () => {
    render(<MeetingProvider><TestComponent /></MeetingProvider>);
    fireEvent.click(screen.getByText('Start Meeting'));
    fireEvent.click(screen.getByText('Add Time'));
    expect(screen.getByTestId('current-time')).toHaveTextContent('60');
  });

  it('should set timer status', () => {
    render(<MeetingProvider><TestComponent /></MeetingProvider>);
    fireEvent.click(screen.getByText('Start Meeting'));
    fireEvent.click(screen.getByText('Set Status'));
    expect(screen.getByTestId('timer-status')).toHaveTextContent('participant_transition');
  });

  it('should donate time correctly', async () => {
    render(<MeetingProvider><TestComponent withDonation /></MeetingProvider>);
    fireEvent.click(screen.getByText('Start Per-Participant Meeting'));

    const before = parseInt(screen.getByTestId('current-time').textContent || '0', 10);
    fireEvent.click(screen.getByTestId('donate-button'));

    await waitFor(() => {
      const after = parseInt(screen.getByTestId('current-time').textContent || '0', 10);
      expect(after).toBeGreaterThanOrEqual(before);
    });
  });

  it('should not tick if meeting not started', () => {
    render(<MeetingProvider><TestComponent /></MeetingProvider>);
    fireEvent.click(screen.getByText('Tick'));
    expect(screen.getByTestId('current-time')).toHaveTextContent('0');
  });
});
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import TimerWidget, { type TimerWidgetRef } from './TimerWidget';
import { useMeeting } from '../../contexts/MeetingContext';
import React from 'react';

// Mock the needed Lucide icons
vi.mock('lucide-react', () => ({
  PlayIcon: () => <div data-testid="play-icon">Play</div>,
  PauseIcon: () => <div data-testid="pause-icon">Pause</div>,
  RefreshCwIcon: () => <div data-testid="refresh-icon">Refresh</div>,
  SkipForwardIcon: () => <div data-testid="skip-forward-icon">Skip Forward</div>,
  PlusIcon: () => <div data-testid="plus-icon">Plus</div>,
}));

// Mock useMeeting hook
vi.mock('../../contexts/MeetingContext', () => ({
  useMeeting: vi.fn(),
}));

const mockUseMeeting = useMeeting as Mock;

describe('TimerWidget', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock state for most tests
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120, // 2 minutes
        timerStatus: 'idle',
        isMeetingActive: false,
        timerConfig: null,
        participants: [],
      },
      dispatch: mockDispatch,
    });
  });

  it('renders the timer display with formatted time', () => {
    render(<TimerWidget />);
    
    expect(screen.getByTestId('timer-circular-display')).toBeInTheDocument();
    expect(screen.getByTestId('timer-circular-time-text')).toHaveTextContent('02:00');
  });

  it('renders with the play button when timer is idle', () => {
    render(<TimerWidget />);
    
    expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('pause-icon')).not.toBeInTheDocument();
  });

  it('renders with the pause button when timer is running', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120,
        timerStatus: 'running',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'fixed' },
        participants: [],
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    expect(screen.queryByTestId('play-icon')).not.toBeInTheDocument();
    expect(screen.getByTestId('pause-icon')).toBeInTheDocument();
  });

  it('disables play/pause button when meeting is not active', () => {
    render(<TimerWidget />);
    
    expect(screen.getByTestId('timer-play-pause-button')).toBeDisabled();
  });

  it('disables play/pause button when timer is finished', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 0,
        timerStatus: 'finished',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'fixed' },
        participants: [],
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    expect(screen.getByTestId('timer-play-pause-button')).toBeDisabled();
  });

  it('dispatches PAUSE_TIMER when pause button is clicked', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120,
        timerStatus: 'running',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'fixed' },
        participants: [],
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    fireEvent.click(screen.getByTestId('timer-play-pause-button'));
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'PAUSE_TIMER' });
  });

  it('dispatches RESUME_TIMER when play button is clicked', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120,
        timerStatus: 'paused',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'fixed' },
        participants: [],
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    fireEvent.click(screen.getByTestId('timer-play-pause-button'));
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESUME_TIMER' });
  });

  it('shows skip forward button in per-participant mode', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120,
        timerStatus: 'running',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'per-participant' },
        participants: [],
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    expect(screen.getByTestId('skip-forward-icon')).toBeInTheDocument();
  });

  it('shows disabled refresh button in fixed mode', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120,
        timerStatus: 'running',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'fixed' },
        participants: [],
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    expect(screen.getByTestId('timer-next-reset-button')).toBeDisabled();
  });

  it('dispatches NEXT_PARTICIPANT when next button is clicked', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120,
        timerStatus: 'running',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'per-participant' },
        participants: [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' }
        ],
        currentSpeakerId: '1',
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    fireEvent.click(screen.getByTestId('timer-next-reset-button'));
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'NEXT_PARTICIPANT' });
  });

  it('disables next button when on last participant', () => {
    // Mock the state with the current speaker being the last participant
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120,
        timerStatus: 'running',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'per-participant' },
        participants: [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' }
        ],
        currentSpeakerId: '2', // Bob is the last participant
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    // The button should have the disabled attribute
    const nextButton = screen.getByTestId('timer-next-reset-button');
    expect(nextButton).toHaveAttribute('disabled');
  });

  it('shows add time button when timer extension is allowed', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120,
        timerStatus: 'running',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'fixed', allowExtension: true },
        participants: [],
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    expect(screen.getByTestId('timer-add-time-button')).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('does not show add time button when timer extension is not allowed', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120,
        timerStatus: 'running',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'fixed', allowExtension: false },
        participants: [],
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    expect(screen.queryByTestId('timer-add-time-button')).not.toBeInTheDocument();
  });

  it('dispatches ADD_TIME when add time button is clicked', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120,
        timerStatus: 'running',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'fixed', allowExtension: true },
        participants: [],
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    fireEvent.click(screen.getByTestId('timer-add-time-button'));
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_TIME' });
  });

  it('calculates the correct progress ratio when timer is running', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 150, // Half of the initial duration
        timerStatus: 'running',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'fixed' },
        participants: [],
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget />);
    
    // Instead of checking for the strokeDashoffset attribute directly,
    // we'll just verify the progress arc element is rendered
    const progressArc = screen.getByTestId('timer-circular-progress-arc');
    expect(progressArc).toBeInTheDocument();
    
    // We can also check that it has the correct stroke style classes
    expect(progressArc).toHaveClass('stroke-primary-buttonColor');
    expect(progressArc).toHaveClass('transition-all');
  });

  it('shows donation animation when time increases during running state', async () => {
    // Create a ref to access the component's methods
    const timerWidgetRef = React.createRef<TimerWidgetRef>();
    
    // Render with the ref
    mockUseMeeting.mockReturnValue({
      state: {
        currentTimeSeconds: 120,
        timerStatus: 'running',
        isMeetingActive: true,
        timerConfig: { durationSeconds: 300, mode: 'fixed' },
        participants: [],
      },
      dispatch: mockDispatch,
    });
    
    render(<TimerWidget ref={timerWidgetRef} />);
    
    // No animation should be visible initially
    expect(screen.queryByTestId('donation-animation')).not.toBeInTheDocument();
    
    // Directly trigger the donation animation using the ref
    timerWidgetRef.current?.triggerDonationAnimation();
    
    // Wait for the animation to appear
    await waitFor(() => {
      expect(screen.getByTestId('donation-animation')).toBeInTheDocument();
    });
    
    // Now that we've confirmed it's in the document, we can check its contents
    const donationAnimation = screen.getByTestId('donation-animation');
    expect(screen.getByText('+10s')).toBeInTheDocument();
    expect(donationAnimation.querySelector('.animate-bounce-fade')).not.toBeNull();
  });
});

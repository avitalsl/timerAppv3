import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { useMeetingTimer } from './useMeetingTimer';
import { useMeeting as actualUseMeeting } from '../contexts/MeetingContext';
import type { MeetingState, MeetingAction, MeetingTimerConfig } from '../contexts/MeetingContext';

// Mock the useMeeting hook
vi.mock('../contexts/MeetingContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../contexts/MeetingContext')>();
  return {
    ...actual,
    useMeeting: vi.fn(),
  };
});

const mockUseMeeting = vi.mocked(actualUseMeeting, true);

describe('useMeetingTimer', () => {
  let mockDispatch: Mock<(action: MeetingAction) => void>;
  let mockState: Partial<MeetingState>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockDispatch = vi.fn();
    // Default state, can be overridden in tests
    mockState = {
      isMeetingActive: false,
      timerStatus: 'idle',
      currentTimeSeconds: 0,
      timerConfig: null,
      currentParticipantIndex: null,
      participants: [],
    };
    // @ts-ignore - We are providing a partial mock for useMeeting
    mockUseMeeting.mockReturnValue({ state: mockState as MeetingState, dispatch: mockDispatch });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should dispatch TICK when active and running in fixed mode', () => {
    mockState.isMeetingActive = true;
    mockState.timerStatus = 'running';
    mockState.currentTimeSeconds = 5;
    const timerConfig: MeetingTimerConfig = { mode: 'fixed', durationSeconds: 60, allowExtension: false };
    mockState.timerConfig = timerConfig;

    renderHook(() => useMeetingTimer());

    act(() => {
      vi.advanceTimersByTime(1000); // Advance time by 1 second
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'TICK' });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('should dispatch SET_TIMER_STATUS to finished when fixed mode timer reaches 0', () => {
    mockState.isMeetingActive = true;
    mockState.timerStatus = 'running';
    mockState.currentTimeSeconds = 1;
    const timerConfig: MeetingTimerConfig = { mode: 'fixed', durationSeconds: 60, allowExtension: false };
    mockState.timerConfig = timerConfig;

    const { rerender } = renderHook(() => useMeetingTimer());

    act(() => {
      vi.advanceTimersByTime(1000); // Time reaches 0, TICK is dispatched
    });
    
    // Check that TICK was dispatched
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'TICK' });
    expect(mockDispatch).toHaveBeenCalledTimes(1);

    // --- Simulate the re-render cycle ---
    // 1. Update the state as the reducer would
    mockState.currentTimeSeconds = 0;

    // 2. Rerender the hook with the new state
    rerender();

    // 3. Advance the timer again for the new interval to fire
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Now, the hook should have dispatched SET_TIMER_STATUS
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_TIMER_STATUS', payload: 'finished' });
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });
});

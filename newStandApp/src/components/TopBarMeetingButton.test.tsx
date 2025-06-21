import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import TopBarMeetingButton from './TopBarMeetingButton';
import { useMeeting } from '../contexts/MeetingContext';
import { useComponentVisibility } from '../hooks/useComponentVisibility';
import { meetingSettingsService } from '../services/meetingSettingsService';

// Mock dependencies
vi.mock('lucide-react', () => ({ Play: () => <svg data-testid="mock-play-icon" /> }));
vi.mock('../contexts/MeetingContext');
vi.mock('../hooks/useComponentVisibility');
vi.mock('../services/meetingSettingsService');

// Cast mocks for type safety
const mockUseMeeting = useMeeting as Mock;
const mockUseComponentVisibility = useComponentVisibility as Mock;
const mockGetAllSettings = meetingSettingsService.getAllSettings as Mock;

describe('TopBarMeetingButton', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockUseMeeting.mockReturnValue({
      dispatch: mockDispatch,
      state: { isMeetingActive: false, timerStatus: 'stopped', isMeetingUIVisible: false },
    });

    mockUseComponentVisibility.mockReturnValue({
      visibilityConfig: { visibleComponents: ['timer', 'participants'] },
    });

    mockGetAllSettings.mockReturnValue({
      timerConfig: { mode: 'fixed' },
      participants: [{ name: 'Alice' }],
      kickoffSettings: { mode: 'getDownToBusiness' },
      participantListVisibilityMode: 'all_visible',
    });
  });

  it('should render the button', () => {
    render(<TopBarMeetingButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('mock-play-icon')).toBeInTheDocument();
  });

  it('should fetch settings and dispatch START_MEETING on click', () => {
    render(<TopBarMeetingButton />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    // Verify that the settings service was called correctly
    expect(mockGetAllSettings).toHaveBeenCalledWith(['timer', 'participants']);

    // Verify that the dispatch function was called with the correct action
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'START_MEETING',
      payload: {
        storedTimerConfig: { mode: 'fixed' },
        participants: [{ name: 'Alice' }],
        kickoffSettings: { mode: 'getDownToBusiness' },
        selectedGridComponentIds: ['timer', 'participants'],
        participantListVisibilityMode: 'all_visible',
      },
    });
  });
});

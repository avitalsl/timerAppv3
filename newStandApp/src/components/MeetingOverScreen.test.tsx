import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MeetingOverScreen from './MeetingOverScreen';

// Mock the useMeeting hook to provide necessary context
vi.mock('../contexts/MeetingContext', () => ({
  useMeeting: () => ({
    state: {
      timerStatus: 'finished',
      meetingStatus: 'Finished',
    },
    dispatch: vi.fn(),
  }),
}));

describe('MeetingOverScreen', () => {
  it('renders the meeting over screen with correct content', () => {
    render(<MeetingOverScreen />);
    
    // Check that the main elements are rendered
    expect(screen.getByTestId('meeting-over-screen')).toBeInTheDocument();
    expect(screen.getByText('Meeting Completed')).toBeInTheDocument();
    expect(screen.getByText('The meeting time has ended. Thank you for participating!')).toBeInTheDocument();
    expect(screen.getByText('Meeting summary and actions will appear here in future versions.')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import MeetingScreen from './MeetingScreen';
import { useMeeting } from '../contexts/MeetingContext';
import { ComponentType } from '../types/layoutTypes';

// Mock dependencies
vi.mock('../contexts/MeetingContext');
vi.mock('./widgets/TimerWidget', () => ({
  default: () => <div data-testid="mock-timer-widget">Timer Widget</div>,
}));
vi.mock('./widgets/ParticipantListWidget', () => ({
  default: () => <div data-testid="mock-participant-list-widget">Participant List Widget</div>,
}));
vi.mock('./widgets/StoryWidget', () => ({
  default: () => <div data-testid="mock-story-widget">Story Widget</div>,
}));
vi.mock('./MeetingOverScreen', () => ({
  default: () => <div data-testid="mock-meeting-over-screen">Meeting Over Screen</div>,
}));

// Mock the placeholder widgets
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    // Mock the placeholder components that are defined inline in MeetingScreen
    FC: (props: any) => props.children,
  };
});

const mockUseMeeting = useMeeting as Mock;

describe('MeetingScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseMeeting.mockReturnValue({
      state: {
        selectedGridComponentIds: [],
        timerStatus: 'idle',
        meetingStatus: 'InProgress',
      },
      dispatch: vi.fn(),
    });
  });

  it('should render the MeetingOverScreen when timerStatus is finished', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        selectedGridComponentIds: ['participants'],
        timerStatus: 'finished',
        meetingStatus: 'InProgress',
      },
      dispatch: vi.fn(),
    });
    
    render(<MeetingScreen />);
    
    // MeetingOverScreen should be rendered
    expect(screen.getByTestId('mock-meeting-over-screen')).toBeInTheDocument();
    
    // Timer sidebar and grid should not be rendered
    expect(screen.queryByTestId('timer-sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('meeting-content-grid')).not.toBeInTheDocument();
  });

  it('should NOT render the MeetingOverScreen when meetingStatus is Finished but timerStatus is not finished', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        selectedGridComponentIds: ['participants'],
        timerStatus: 'idle',
        meetingStatus: 'Finished',
      },
      dispatch: vi.fn(),
    });
    
    render(<MeetingScreen />);
    
    // MeetingOverScreen should NOT be rendered
    expect(screen.queryByTestId('mock-meeting-over-screen')).not.toBeInTheDocument();
    
    // Timer sidebar should be rendered
    expect(screen.getByTestId('timer-sidebar')).toBeInTheDocument();
  });

  it('should render the timer sidebar', () => {
    render(<MeetingScreen />);
    
    expect(screen.getByTestId('timer-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-timer-widget')).toBeInTheDocument();
  });

  it('should show empty message when no components are selected', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        selectedGridComponentIds: [],
      },
      dispatch: vi.fn(),
    });
    
    render(<MeetingScreen />);
    
    expect(screen.getByTestId('empty-grid-message')).toBeInTheDocument();
    expect(screen.getByText('No additional components selected for the meeting.')).toBeInTheDocument();
  });

  it('should render selected components in the grid', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        selectedGridComponentIds: ['participants', ComponentType.STORY],
      },
      dispatch: vi.fn(),
    });
    
    render(<MeetingScreen />);
    
    // Check that the empty message is not shown
    expect(screen.queryByTestId('empty-grid-message')).not.toBeInTheDocument();
    
    // Check that the components are rendered
    expect(screen.getByTestId('grid-item-participants')).toBeInTheDocument();
    expect(screen.getByTestId('mock-participant-list-widget')).toBeInTheDocument();
    
    expect(screen.getByTestId(`grid-item-${ComponentType.STORY}`)).toBeInTheDocument();
    expect(screen.getByTestId('mock-story-widget')).toBeInTheDocument();
  });

  it('should filter out the timer from the grid content', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        selectedGridComponentIds: ['timer', 'participants'],
      },
      dispatch: vi.fn(),
    });
    
    render(<MeetingScreen />);
    
    // Timer should not appear in the grid (only in the sidebar)
    expect(screen.queryByTestId('grid-item-timer')).not.toBeInTheDocument();
    
    // Timer should be in the sidebar
    expect(screen.getByTestId('timer-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-timer-widget')).toBeInTheDocument();
    
    // Participants widget should be in the grid
    expect(screen.getByTestId('grid-item-participants')).toBeInTheDocument();
  });

  it('should filter out components that are not in the registry', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        selectedGridComponentIds: ['participants', 'nonexistent-component'],
      },
      dispatch: vi.fn(),
    });
    
    render(<MeetingScreen />);
    
    // Only the participants component should be rendered
    expect(screen.getByTestId('grid-item-participants')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-item-nonexistent-component')).not.toBeInTheDocument();
  });

  // Additional test for component sorting by render priority could be added here
  // if we have access to the COMPONENT_DEFINITIONS with their renderPriority values
});

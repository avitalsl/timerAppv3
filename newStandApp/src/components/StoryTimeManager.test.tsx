import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import StoryTimeManager from './StoryTimeManager';
import { useMeeting } from '../contexts/MeetingContext';
import type { Participant } from '../contexts/MeetingContext';

// Mock dependencies
vi.mock('../contexts/MeetingContext', () => ({
  useMeeting: vi.fn(),
}));

const mockUseMeeting = useMeeting as Mock;

describe('StoryTimeManager', () => {
  // Set up some test participants
  const testParticipants: Participant[] = [
    { name: 'Alice', included: true },
    { name: 'Bob', included: true },
    { name: 'Charlie', included: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for inactive story time
    mockUseMeeting.mockReturnValue({
      state: {
        kickoffSettings: { mode: 'standard' },
        participants: [],
      },
      dispatch: vi.fn(),
    });
  });

  it('should not render when kickoffSettings.mode is not storyTime', () => {
    render(<StoryTimeManager />);
    expect(screen.queryByTestId('story-time-manager')).not.toBeInTheDocument();
  });

  it('should render when kickoffSettings.mode is storyTime, even without participants', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        kickoffSettings: { mode: 'storyTime' },
        participants: [],
      },
      dispatch: vi.fn(),
    });
    
    render(<StoryTimeManager />);
    
    expect(screen.getByTestId('story-time-manager')).toBeInTheDocument();
    expect(screen.getByText('Story Time!')).toBeInTheDocument();
    expect(screen.getByTestId('story-teller-pending')).toBeInTheDocument();
    expect(screen.getByText('Waiting to determine the storyteller (or no participants available)...')).toBeInTheDocument();
  });

  it('should select a storyteller when mode is random and participants exist', () => {
    // Mock Math.random to return a consistent value for testing
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1); // This will select the first participant
    
    mockUseMeeting.mockReturnValue({
      state: {
        kickoffSettings: { mode: 'storyTime', storyOption: 'random' },
        participants: testParticipants,
      },
      dispatch: vi.fn(),
    });
    
    render(<StoryTimeManager />);
    
    expect(screen.getByTestId('story-time-manager')).toBeInTheDocument();
    expect(screen.getByTestId('story-teller-announcement')).toBeInTheDocument();
    expect(screen.getByText(/Our storyteller is:/)).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    
    randomSpy.mockRestore();
  });

  it('should select the first participant when mode is manual', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        kickoffSettings: { mode: 'storyTime', storyOption: 'manual' },
        participants: testParticipants,
      },
      dispatch: vi.fn(),
    });
    
    render(<StoryTimeManager />);
    
    expect(screen.getByTestId('story-time-manager')).toBeInTheDocument();
    expect(screen.getByTestId('story-teller-announcement')).toBeInTheDocument();
    expect(screen.getByText(/Our storyteller is:/)).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  // Test with empty participants array
  it('should show waiting message when no participants available', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        kickoffSettings: { mode: 'storyTime', storyOption: 'random' },
        participants: [], // No participants
      },
      dispatch: vi.fn(),
    });
    
    render(<StoryTimeManager />);
    
    expect(screen.getByTestId('story-time-manager')).toBeInTheDocument();
    expect(screen.getByTestId('story-teller-pending')).toBeInTheDocument();
    expect(screen.getByText('Waiting to determine the storyteller (or no participants available)...')).toBeInTheDocument();
  });
});

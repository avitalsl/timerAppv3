import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import StoryWidget from './StoryWidget';
import { useMeeting } from '../../contexts/MeetingContext';
import { ComponentType } from '../../types/layoutTypes';

// Mock useMeeting hook
vi.mock('../../contexts/MeetingContext', () => ({
  useMeeting: vi.fn(),
}));

const mockUseMeeting = useMeeting as Mock;

describe('StoryWidget', () => {
  const mockDispatch = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Default mock state - story time active
    mockUseMeeting.mockReturnValue({
      state: {
        kickoffSettings: { 
          mode: 'storyTime',
          storyDurationSeconds: 60,
          storytellerName: 'Alice'
        }
      },
      dispatch: mockDispatch,
    });
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders story time information when active', () => {
    render(<StoryWidget />);
    
    expect(screen.getByTestId('story-time-widget-container')).toBeInTheDocument();
    expect(screen.getByTestId('story-teller-announcement')).toHaveTextContent('Storyteller: Alice');
    expect(screen.getByTestId('story-duration-display')).toHaveTextContent('Time remaining: 60 seconds');
    expect(screen.getByText('End Story Time')).toBeInTheDocument();
  });

  it('uses default storyteller name if not provided', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        kickoffSettings: { 
          mode: 'storyTime',
          storyDurationSeconds: 60,
          // No storytellerName provided
        }
      },
      dispatch: mockDispatch,
    });
    
    render(<StoryWidget />);
    
    expect(screen.getByTestId('story-teller-announcement')).toHaveTextContent('Storyteller: The Storyteller');
  });

  it('renders fallback message when story time is not active', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        kickoffSettings: { 
          mode: 'standard', // Not story time
          storyDurationSeconds: 0
        }
      },
      dispatch: mockDispatch,
    });
    
    render(<StoryWidget />);
    
    expect(screen.getByText('Story time is not active or configured.')).toBeInTheDocument();
    expect(screen.queryByTestId('story-time-widget-container')).not.toBeInTheDocument();
  });

  it('renders fallback when duration is zero or negative', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        kickoffSettings: { 
          mode: 'storyTime',
          storyDurationSeconds: 0, // Zero duration
          storytellerName: 'Alice'
        }
      },
      dispatch: mockDispatch,
    });
    
    render(<StoryWidget />);
    
    expect(screen.getByText('Story time is not active or configured.')).toBeInTheDocument();
    expect(screen.queryByTestId('story-time-widget-container')).not.toBeInTheDocument();
  });

  it('decrements time remaining each second', () => {
    render(<StoryWidget />);
    
    expect(screen.getByTestId('story-duration-display')).toHaveTextContent('Time remaining: 60 seconds');
    
    // Advance timer by one second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByTestId('story-duration-display')).toHaveTextContent('Time remaining: 59 seconds');
    
    // Advance timer by another second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByTestId('story-duration-display')).toHaveTextContent('Time remaining: 58 seconds');
  });

  it('dispatches removal when End Story Time button is clicked', () => {
    render(<StoryWidget />);
    
    fireEvent.click(screen.getByText('End Story Time'));
    
    expect(mockDispatch).toHaveBeenCalledWith({ 
      type: 'REMOVE_COMPONENT_FROM_GRID', 
      payload: ComponentType.STORY 
    });
  });

  it('auto-removes itself when timer reaches zero', () => {
    render(<StoryWidget />);
    
    // Advance timer to just before zero
    act(() => {
      vi.advanceTimersByTime(59000);
    });
    
    expect(screen.getByTestId('story-duration-display')).toHaveTextContent('Time remaining: 1 seconds');
    
    // Advance timer to zero and beyond
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // Check that the dispatch was called with the correct action
    expect(mockDispatch).toHaveBeenCalledWith({ 
      type: 'REMOVE_COMPONENT_FROM_GRID', 
      payload: ComponentType.STORY 
    });
  });
});

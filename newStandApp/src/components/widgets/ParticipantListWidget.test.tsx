import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import ParticipantListWidget from './ParticipantListWidget';
import { useMeeting } from '../../contexts/MeetingContext';
import type { Participant } from '../../contexts/MeetingContext';
import { ParticipantStatus } from '../../contexts/MeetingContext';

// Mock the Lucide icon
vi.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon">User Icon</div>
}));

// Mock useMeeting hook
vi.mock('../../contexts/MeetingContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/MeetingContext')>();
  return {
    ...actual,
    useMeeting: vi.fn(),
  };
});

const mockUseMeeting = useMeeting as Mock;

describe('ParticipantListWidget', () => {
  const mockParticipants: Participant[] = [
    { 
      id: '1',
      name: 'Alice', 
      included: true,
      allocatedTimeSeconds: 120,
      remainingTimeSeconds: 120,
      usedTimeSeconds: 0,
      donatedTimeSeconds: 0,
      receivedTimeSeconds: 0,
      status: ParticipantStatus.PENDING,
      hasSpeakerRole: false
    },
    { 
      id: '2',
      name: 'Bob', 
      included: true,
      allocatedTimeSeconds: 120,
      remainingTimeSeconds: 120,
      usedTimeSeconds: 0,
      donatedTimeSeconds: 0,
      receivedTimeSeconds: 0,
      status: ParticipantStatus.PENDING,
      hasSpeakerRole: false
    },
    { 
      id: '3',
      name: 'Charlie', 
      included: true,
      allocatedTimeSeconds: 120,
      remainingTimeSeconds: 120,
      usedTimeSeconds: 0,
      donatedTimeSeconds: 0,
      receivedTimeSeconds: 0,
      status: ParticipantStatus.PENDING,
      hasSpeakerRole: false
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock state for inactive meeting
    mockUseMeeting.mockReturnValue({
      state: {
        participants: [],
        currentParticipantIndex: null,
        participantListVisibilityMode: 'normal',
        timerConfig: null,
        isMeetingActive: false,
      },
    });
  });

  it('renders inactive state when meeting is not active', () => {
    render(<ParticipantListWidget />);
    
    expect(screen.getByTestId('widget-participants-inactive')).toBeInTheDocument();
    expect(screen.getByText('Participant list will appear here when the meeting starts.')).toBeInTheDocument();
  });

  it('renders empty state when meeting is active but has no participants', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        participants: [],
        currentParticipantIndex: null,
        participantListVisibilityMode: 'normal',
        timerConfig: null,
        isMeetingActive: true,
      },
    });
    
    render(<ParticipantListWidget />);
    
    expect(screen.getByTestId('widget-participants-empty')).toBeInTheDocument();
    expect(screen.getByText('No participants in this meeting.')).toBeInTheDocument();
  });

  it('renders participants list when meeting is active with participants', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        participants: mockParticipants,
        currentParticipantIndex: null,
        participantListVisibilityMode: 'normal',
        timerConfig: null,
        isMeetingActive: true,
      },
    });
    
    render(<ParticipantListWidget />);
    
    expect(screen.getByTestId('widget-participants')).toBeInTheDocument();
    expect(screen.getByText('Participants')).toBeInTheDocument();
    
    // Check for all participant names
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    
    // Check for the list element
    expect(screen.getByTestId('participant-list-ul')).toBeInTheDocument();
    
    // Test individual participant items
    expect(screen.getByTestId('participant-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('participant-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('participant-item-2')).toBeInTheDocument();
  });

  it('highlights the current speaker in per-participant mode', () => {
    const currentParticipantIndex = 1; // Bob
    
    mockUseMeeting.mockReturnValue({
      state: {
        participants: mockParticipants,
        currentParticipantIndex,
        participantListVisibilityMode: 'normal',
        timerConfig: { mode: 'per-participant', durationSeconds: 60 },
        isMeetingActive: true,
      },
    });
    
    render(<ParticipantListWidget />);
    
    // Current participant item should have specific styling classes
    const currentParticipantItem = screen.getByTestId(`participant-item-${currentParticipantIndex}`);
    expect(currentParticipantItem).toHaveClass('bg-primary-light');
    expect(currentParticipantItem).toHaveClass('text-primary-dark');
    expect(currentParticipantItem).toHaveClass('font-semibold');
    
    // Other participants should not have those classes
    const otherParticipantItem = screen.getByTestId('participant-item-0');
    expect(otherParticipantItem).not.toHaveClass('bg-primary-light');
    expect(otherParticipantItem).not.toHaveClass('font-semibold');
    expect(otherParticipantItem).toHaveClass('text-gray-800');
  });

  it('applies blur styling to non-speakers when in focus mode', () => {
    const currentParticipantIndex = 0; // Alice
    
    mockUseMeeting.mockReturnValue({
      state: {
        participants: mockParticipants,
        currentParticipantIndex,
        participantListVisibilityMode: 'focus_speaker',
        timerConfig: { mode: 'per-participant', durationSeconds: 60 },
        isMeetingActive: true,
      },
    });
    
    render(<ParticipantListWidget />);
    
    // Current speaker should not be blurred
    const currentSpeaker = screen.getByTestId(`participant-item-${currentParticipantIndex}`);
    expect(currentSpeaker).not.toHaveClass('filter');
    expect(currentSpeaker).not.toHaveClass('blur-sm');
    expect(currentSpeaker).not.toHaveClass('opacity-60');
    
    // Other participants should be blurred
    const nonSpeaker1 = screen.getByTestId('participant-item-1');
    const nonSpeaker2 = screen.getByTestId('participant-item-2');
    
    expect(nonSpeaker1).toHaveClass('filter');
    expect(nonSpeaker1).toHaveClass('blur-sm');
    expect(nonSpeaker1).toHaveClass('opacity-60');
    
    expect(nonSpeaker2).toHaveClass('filter');
    expect(nonSpeaker2).toHaveClass('blur-sm');
    expect(nonSpeaker2).toHaveClass('opacity-60');
  });

  it('does not highlight any participant when in fixed mode', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        participants: mockParticipants,
        currentParticipantIndex: 0, // Even with a current index
        participantListVisibilityMode: 'normal',
        timerConfig: { mode: 'fixed', durationSeconds: 300 }, // Fixed mode
        isMeetingActive: true,
      },
    });
    
    render(<ParticipantListWidget />);
    
    // No participant should have the highlight styles
    const participant0 = screen.getByTestId('participant-item-0');
    expect(participant0).not.toHaveClass('bg-primary-light');
    expect(participant0).not.toHaveClass('font-semibold');
    
    const participant1 = screen.getByTestId('participant-item-1');
    expect(participant1).not.toHaveClass('bg-primary-light');
    expect(participant1).not.toHaveClass('font-semibold');
  });
});

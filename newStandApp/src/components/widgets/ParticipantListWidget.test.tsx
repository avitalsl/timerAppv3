import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import ParticipantListWidget from './ParticipantListWidget';
import { useMeeting } from '../../contexts/MeetingContext';
import type { Participant } from '../../contexts/MeetingContext';
import { ParticipantStatus } from '../../contexts/MeetingContext';
import { useUserContext } from '../../contexts/UserContext';

// Mock the Lucide icons
vi.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon">User Icon</div>,
  Gift: () => <div data-testid="gift-icon">Gift Icon</div>,
  SkipForward: () => <div data-testid="skip-icon">Skip Icon</div>,
  Lock: () => <div data-testid="lock-icon">Lock Icon</div>
}));

// Mock the meetingTimerService
vi.mock('../../services/meetingTimerService', () => ({
  meetingTimerService: {
    canDonateTime: vi.fn().mockReturnValue({ canDonate: true, maxAmount: 10 })
  }
}));

// Mock useUserContext
vi.mock('../../contexts/UserContext', () => ({
  useUserContext: vi.fn().mockReturnValue({
    isInteractiveUser: vi.fn().mockReturnValue(true),
    currentUser: { id: '1', name: 'Test User' }
  })
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
    
    // Check for all participant cards
    expect(screen.getByTestId('participant-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('participant-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('participant-card-3')).toBeInTheDocument();
    
    // Check for the list element
    expect(screen.getByTestId('participant-list-ul')).toBeInTheDocument();
  });

  it('highlights the current speaker in per-participant mode', () => {
    const currentParticipantIndex = 0; // Alice
    
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
    
    // Current participant card should have ring styling
    const currentParticipantCard = screen.getByTestId(`participant-card-${mockParticipants[currentParticipantIndex].id}`);
    expect(currentParticipantCard).toHaveClass('ring-2');
    expect(currentParticipantCard).toHaveClass('ring-primary-dark');
    
    // Other participants should not have those classes
    const otherParticipantCard = screen.getByTestId('participant-card-2');
    expect(otherParticipantCard).not.toHaveClass('ring-2');
    expect(otherParticipantCard).not.toHaveClass('ring-primary-dark');
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
      dispatch: vi.fn(),
    });
    
    render(<ParticipantListWidget />);
    
    // Get all participant cards
    const participantCards = screen.getAllByTestId(/^participant-card-/);
    
    // Find the parent divs that contain the style attributes
    const parentDivs = Array.from(participantCards).map(card => card.parentElement);
    
    // Check that non-speaker cards have blur styling
    expect(parentDivs[1]).toHaveAttribute('style', expect.stringContaining('blur'));
    expect(parentDivs[1]).toHaveAttribute('style', expect.stringContaining('opacity'));
    expect(parentDivs[2]).toHaveAttribute('style', expect.stringContaining('blur'));
    
    // Check that current speaker doesn't have blur
    expect(parentDivs[0]).not.toHaveAttribute('style', expect.stringContaining('blur'));
  });

  it('does not highlight any participant when in fixed mode', () => {
    mockUseMeeting.mockReturnValue({
      state: {
        participants: mockParticipants,
        currentParticipantIndex: null, // No current participant in fixed mode
        participantListVisibilityMode: 'normal',
        timerConfig: { mode: 'fixed', durationSeconds: 300 }, // Fixed mode
        isMeetingActive: true,
      },
      dispatch: vi.fn(),
    });
    
    render(<ParticipantListWidget />);
    
    // No participant should have the highlight styles
    const participant0 = screen.getByTestId('participant-card-1');
    expect(participant0).not.toHaveClass('ring-2');
    expect(participant0).not.toHaveClass('ring-primary-dark');
    
    const participant1 = screen.getByTestId('participant-card-2');
    expect(participant1).not.toHaveClass('ring-2');
    expect(participant1).not.toHaveClass('ring-primary-dark');
  });
});

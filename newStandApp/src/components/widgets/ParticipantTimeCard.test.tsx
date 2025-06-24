import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ParticipantTimeCard from './ParticipantTimeCard';
import { ParticipantStatus } from '../../contexts/MeetingContext';
import { useUserContext } from '../../contexts/UserContext';
import { useMeeting } from '../../contexts/MeetingContext';
import type { Participant } from '../../contexts/MeetingContext';
import { meetingTimerService } from '../../services/meetingTimerService';

// Mock the Lucide icons
vi.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon">User Icon</div>,
  Gift: () => <div data-testid="gift-icon">Gift Icon</div>,
  SkipForward: () => <div data-testid="skip-icon">Skip Icon</div>,
  Lock: () => <div data-testid="lock-icon">Lock Icon</div>
}));

// Mock useUserContext
vi.mock('../../contexts/UserContext', () => ({
  useUserContext: vi.fn()
}));

// Mock useMeeting
vi.mock('../../contexts/MeetingContext', () => ({
  useMeeting: vi.fn(),
  ParticipantStatus: {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    FINISHED: 'FINISHED',
    SKIPPED: 'SKIPPED'
  }
}));

// Mock the meetingTimerService
vi.mock('../../services/meetingTimerService', () => ({
  meetingTimerService: {
    canDonateTime: vi.fn().mockReturnValue({ canDonate: true, maxAmount: 10 })
  }
}));

describe('ParticipantTimeCard', () => {
  // Mock participant data
  const mockParticipant: Participant = {
    id: 'test-id',
    name: 'Test User',
    included: true,
    allocatedTimeSeconds: 120,
    remainingTimeSeconds: 90,
    usedTimeSeconds: 30,
    status: ParticipantStatus.ACTIVE,
    hasSpeakerRole: true,
    type: 'interactive'
  };

  // Mock handlers
  const mockDonateClick = vi.fn();
  const mockSkipClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for useMeeting
    (useMeeting as any).mockReturnValue({
      state: {
        currentSpeakerId: 'speaker-id'
      }
    });
  });

  it('renders participant information correctly', () => {
    // Mock as interactive user
    (useUserContext as any).mockReturnValue({
      isInteractiveUser: () => true,
      currentUser: { id: 'other-id', name: 'Current User' }
    });

    render(
      <ParticipantTimeCard
        participant={mockParticipant}
        isCurrentSpeaker={true}
        onDonateClick={mockDonateClick}
        onSkipClick={mockSkipClick}
      />
    );

    // Check basic information is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    // Only check for remaining time since we've simplified the UI
    expect(screen.getByText('01:30')).toBeInTheDocument(); // Remaining time
  });

  it('shows donate button for current user when they are interactive and not the speaker', () => {
    // Mock as interactive user
    (useUserContext as any).mockReturnValue({
      isInteractiveUser: () => true,
      currentUser: { id: 'test-id', name: 'Test User' }
    });

    // Mock current speaker as different from current user
    (useMeeting as any).mockReturnValue({
      state: {
        currentSpeakerId: 'speaker-id'
      }
    });

    render(
      <ParticipantTimeCard
        participant={mockParticipant}
        isCurrentSpeaker={false}
        onDonateClick={mockDonateClick}
        onSkipClick={mockSkipClick}
      />
    );

    // Check that donate button is displayed
    const donateButton = screen.getByTestId(`donate-btn-${mockParticipant.id}`);
    expect(donateButton).toBeInTheDocument();
    expect(screen.getByText('Donate 10s')).toBeInTheDocument();
    
    // Check tooltip text
    expect(donateButton).toHaveAttribute('title', 'Give 10 seconds to the speaker');
  });

  it('hides donate button when user is the current speaker', () => {
    // Mock as interactive user
    (useUserContext as any).mockReturnValue({
      isInteractiveUser: () => true,
      currentUser: { id: 'test-id', name: 'Test User' }
    });

    // Mock current speaker as the same as current user
    (useMeeting as any).mockReturnValue({
      state: {
        currentSpeakerId: 'test-id'
      }
    });

    render(
      <ParticipantTimeCard
        participant={mockParticipant}
        isCurrentSpeaker={true}
        onDonateClick={mockDonateClick}
        onSkipClick={mockSkipClick}
      />
    );

    // Check that donate button is not displayed
    expect(screen.queryByTestId(`donate-btn-${mockParticipant.id}`)).not.toBeInTheDocument();
    expect(screen.queryByText('Donate 10s')).not.toBeInTheDocument();
  });

  it('shows skip button for pending participants when user is interactive', () => {
    // Mock as interactive user
    (useUserContext as any).mockReturnValue({
      isInteractiveUser: () => true,
      currentUser: { id: 'other-id', name: 'Current User' }
    });

    const pendingParticipant = {
      ...mockParticipant,
      status: ParticipantStatus.PENDING
    };

    render(
      <ParticipantTimeCard
        participant={pendingParticipant}
        isCurrentSpeaker={false}
        onDonateClick={mockDonateClick}
        onSkipClick={mockSkipClick}
      />
    );

    // Check that skip button is displayed
    expect(screen.getByTestId(`skip-btn-${mockParticipant.id}`)).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('hides action buttons and shows view-only message for non-interactive users', () => {
    // Mock as non-interactive (viewOnly) user
    (useUserContext as any).mockReturnValue({
      isInteractiveUser: () => false,
      currentUser: { id: 'view-only-id', name: 'View Only User', type: 'viewOnly' }
    });

    render(
      <ParticipantTimeCard
        participant={mockParticipant}
        isCurrentSpeaker={false}
        onDonateClick={mockDonateClick}
        onSkipClick={mockSkipClick}
      />
    );

    // Check that action buttons are not displayed
    expect(screen.queryByTestId(`donate-btn-${mockParticipant.id}`)).not.toBeInTheDocument();
    expect(screen.queryByText('Donate 10s')).not.toBeInTheDocument();
    expect(screen.queryByText('Skip')).not.toBeInTheDocument();
    
    // Check that view-only message is displayed
    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    expect(screen.getByText('View only')).toBeInTheDocument();
  });

  // Test for handling incomplete participant data
  it('handles incomplete participant data with undefined time properties', () => {
    // Use type assertion to create an incomplete participant object
    const incompleteParticipant = {
      id: 'incomplete-id',
      name: 'Incomplete User',
      included: true,
      status: ParticipantStatus.PENDING,
      hasSpeakerRole: false,
      type: 'viewOnly'
      // Missing time properties: allocatedTimeSeconds, remainingTimeSeconds, etc.
    } as Participant;

    // Mock useUserContext to return non-interactive user
    (useUserContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isInteractiveUser: () => false,
      currentUser: { id: 'other-user', name: 'Other User' }
    });

    render(
      <ParticipantTimeCard
        participant={incompleteParticipant}
        isCurrentSpeaker={false}
        onDonateClick={mockDonateClick}
      />
    );

    // Time displays should show "00:00" instead of "NaN:NaN"
    const timeDisplays = screen.getAllByText('00:00');
    expect(timeDisplays.length).toBeGreaterThan(0);
    
    // Component should render without errors
    expect(screen.getByText('Incomplete User')).toBeInTheDocument();
    expect(screen.getByTestId(`participant-card-${incompleteParticipant.id}`)).toBeInTheDocument();
  });
});

// Create a separate test suite for the disabled donation button scenario
describe('ParticipantTimeCard with disabled donation', () => {
  // Mock participant data
  const mockParticipant: Participant = {
    id: 'test-id',
    name: 'Test User',
    included: true,
    allocatedTimeSeconds: 120,
    remainingTimeSeconds: 5, // Not enough time to donate
    usedTimeSeconds: 30,
    status: ParticipantStatus.ACTIVE,
    hasSpeakerRole: true,
    type: 'interactive'
  };

  // Mock handlers
  const mockDonateClick = vi.fn();
  const mockSkipClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useMeeting
    (useMeeting as any).mockReturnValue({
      state: {
        currentSpeakerId: 'speaker-id'
      }
    });
    
    // Mock canDonateTime to return false for this test
    (meetingTimerService.canDonateTime as any).mockReturnValue({ canDonate: false, maxAmount: 0 });
  });

  it('disables donate button when user has insufficient time', () => {
    // Mock as interactive user who is the owner of this card
    (useUserContext as any).mockReturnValue({
      isInteractiveUser: () => true,
      currentUser: { id: 'test-id', name: 'Test User' }
    });

    render(
      <ParticipantTimeCard
        participant={mockParticipant}
        isCurrentSpeaker={false}
        onDonateClick={mockDonateClick}
        onSkipClick={mockSkipClick}
      />
    );

    // Check that donate button is disabled
    const donateButton = screen.getByTestId(`donate-btn-${mockParticipant.id}`);
    expect(donateButton).toBeInTheDocument();
    expect(donateButton).toBeDisabled();
    expect(donateButton).toHaveClass('cursor-not-allowed');
    expect(donateButton).toHaveClass('bg-gray-100');
    expect(donateButton).toHaveClass('text-gray-400');
  });
});

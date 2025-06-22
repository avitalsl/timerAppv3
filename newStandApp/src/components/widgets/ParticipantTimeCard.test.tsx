import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ParticipantTimeCard from './ParticipantTimeCard';
import { ParticipantStatus } from '../../contexts/MeetingContext';
import { useUserContext } from '../../contexts/UserContext';
import type { Participant } from '../../contexts/MeetingContext';

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
    donatedTimeSeconds: 10,
    receivedTimeSeconds: 20,
    status: ParticipantStatus.ACTIVE,
    hasSpeakerRole: true
  };

  // Mock handlers
  const mockDonateClick = vi.fn();
  const mockSkipClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(screen.getByText('02:00')).toBeInTheDocument(); // Allocated time
    expect(screen.getByText('01:30')).toBeInTheDocument(); // Remaining time
    expect(screen.getByText('00:30')).toBeInTheDocument(); // Used time
    
    // Check net donated time display
    expect(screen.getByText('+00:10')).toBeInTheDocument(); // Net donated (received - donated)
  });

  it('shows action buttons for interactive users', () => {
    // Mock as interactive user
    (useUserContext as any).mockReturnValue({
      isInteractiveUser: () => true,
      currentUser: { id: 'other-id', name: 'Current User' }
    });

    render(
      <ParticipantTimeCard
        participant={mockParticipant}
        isCurrentSpeaker={false}
        onDonateClick={mockDonateClick}
        onSkipClick={mockSkipClick}
      />
    );

    // Check that action buttons are displayed
    expect(screen.getByTestId(`donate-btn-${mockParticipant.id}`)).toBeInTheDocument();
    expect(screen.getByText('Donate')).toBeInTheDocument();
    
    // Skip button should not be visible for ACTIVE participants
    expect(screen.queryByText('Skip')).not.toBeInTheDocument();
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

    // Check that both donate and skip buttons are displayed
    expect(screen.getByTestId(`donate-btn-${mockParticipant.id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`skip-btn-${mockParticipant.id}`)).toBeInTheDocument();
    expect(screen.getByText('Donate')).toBeInTheDocument();
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
    expect(screen.queryByText('Donate')).not.toBeInTheDocument();
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
      hasSpeakerRole: false
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
    remainingTimeSeconds: 90,
    usedTimeSeconds: 30,
    donatedTimeSeconds: 10,
    receivedTimeSeconds: 20,
    status: ParticipantStatus.ACTIVE,
    hasSpeakerRole: true
  };

  // Mock handlers
  const mockDonateClick = vi.fn();
  const mockSkipClick = vi.fn();

  // For this suite, we'll mock canDonateTime to return false
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables donate button when donation is not possible', () => {
    // Mock canDonateTime to return false for this test
    vi.mock('../../services/meetingTimerService', () => ({
      meetingTimerService: {
        canDonateTime: vi.fn().mockReturnValue({ canDonate: false, maxAmount: 0 })
      }
    }));
    
    // Mock as interactive user
    (useUserContext as any).mockReturnValue({
      isInteractiveUser: () => true,
      currentUser: { id: 'other-id', name: 'Current User' }
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
  });
});

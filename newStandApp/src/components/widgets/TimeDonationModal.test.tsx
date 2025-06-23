import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TimeDonationModal from './TimeDonationModal';
import { useMeeting } from '../../contexts/MeetingContext';
import { ParticipantStatus } from '../../contexts/MeetingContext';

// Mock the useMeeting hook
vi.mock('../../contexts/MeetingContext', () => ({
  useMeeting: vi.fn(),
  ParticipantStatus: {
    ACTIVE: 'ACTIVE',
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED'
  }
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X Icon</div>,
  Clock: () => <div data-testid="clock-icon">Clock Icon</div>
}));

describe('TimeDonationModal', () => {
  // Mock props
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    donorId: 'donor-1',
    recipientId: 'recipient-1',
    maxDonationSeconds: 60,
    onDonationSubmit: vi.fn()
  };

  // Mock participants
  const mockParticipants = [
    {
      id: 'donor-1',
      name: 'Donor User',
      included: true,
      allocatedTimeSeconds: 120,
      remainingTimeSeconds: 90,
      usedTimeSeconds: 30,
      donatedTimeSeconds: 0,
      receivedTimeSeconds: 0,
      status: ParticipantStatus.ACTIVE,
      hasSpeakerRole: false
    },
    {
      id: 'recipient-1',
      name: 'Recipient User',
      included: true,
      allocatedTimeSeconds: 120,
      remainingTimeSeconds: 60,
      usedTimeSeconds: 60,
      donatedTimeSeconds: 0,
      receivedTimeSeconds: 0,
      status: ParticipantStatus.PENDING,
      hasSpeakerRole: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the useMeeting hook to return our test state
    (useMeeting as any).mockReturnValue({
      state: {
        participants: mockParticipants
      }
    });
  });

  it('renders the modal when isOpen is true', () => {
    render(<TimeDonationModal {...mockProps} />);
    
    expect(screen.getByTestId('time-donation-modal')).toBeInTheDocument();
    expect(screen.getByText('Donate Time')).toBeInTheDocument();
    expect(screen.getByText('Donor User')).toBeInTheDocument();
    expect(screen.getByText('Recipient User')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<TimeDonationModal {...mockProps} isOpen={false} />);
    
    expect(screen.queryByTestId('time-donation-modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<TimeDonationModal {...mockProps} />);
    
    const closeButton = screen.getByTestId('modal-close-btn');
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<TimeDonationModal {...mockProps} />);
    
    const cancelButton = screen.getByTestId('cancel-btn');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('generates time donation options based on maxDonationSeconds', () => {
    render(<TimeDonationModal {...mockProps} maxDonationSeconds={45} />);
    
    // Should have options for 15, 30, and 45 seconds
    expect(screen.getByTestId('time-option-15')).toBeInTheDocument();
    expect(screen.getByTestId('time-option-30')).toBeInTheDocument();
    expect(screen.getByTestId('time-option-45')).toBeInTheDocument();
    expect(screen.queryByTestId('time-option-60')).not.toBeInTheDocument();
  });

  it('updates donation amount when a time option is clicked', () => {
    render(<TimeDonationModal {...mockProps} />);
    
    // Default should be 30 seconds
    expect(screen.getByTestId('donate-btn')).toHaveTextContent('Donate 0:30');
    
    // Click on 15 seconds option
    const option15 = screen.getByTestId('time-option-15');
    fireEvent.click(option15);
    
    // Button text should update
    expect(screen.getByTestId('donate-btn')).toHaveTextContent('Donate 0:15');
  });

  it('updates donation amount when slider is adjusted', () => {
    render(<TimeDonationModal {...mockProps} />);
    
    // Default should be 30 seconds
    expect(screen.getByTestId('donate-btn')).toHaveTextContent('Donate 0:30');
    
    // Change slider value to 45
    const slider = screen.getByTestId('donation-slider');
    fireEvent.change(slider, { target: { value: '45' } });
    
    // Button text should update
    expect(screen.getByTestId('donate-btn')).toHaveTextContent('Donate 0:45');
  });

  it('calls onDonationSubmit with correct values when form is submitted', () => {
    render(<TimeDonationModal {...mockProps} />);
    
    // Change donation amount to 45 seconds
    const option45 = screen.getByTestId('time-option-45');
    fireEvent.click(option45);
    
    // Submit the form
    const donateButton = screen.getByTestId('donate-btn');
    fireEvent.click(donateButton);
    
    // Check if onDonationSubmit was called with correct parameters
    expect(mockProps.onDonationSubmit).toHaveBeenCalledTimes(1);
    expect(mockProps.onDonationSubmit).toHaveBeenCalledWith('donor-1', 'recipient-1', 45);
    
    // Check if onClose was called after submission
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('sets donation amount to min(30, maxDonationSeconds) when modal opens', () => {
    // Test with maxDonationSeconds = 60
    render(<TimeDonationModal {...mockProps} />);
    expect(screen.getByTestId('donate-btn')).toHaveTextContent('Donate 0:30');
    
    // Cleanup
    cleanup();
    
    // Test with maxDonationSeconds = 15
    render(<TimeDonationModal {...mockProps} maxDonationSeconds={15} />);
    expect(screen.getByTestId('donate-btn')).toHaveTextContent('Donate 0:15');
  });
});

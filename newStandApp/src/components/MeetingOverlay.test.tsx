import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import MeetingOverlay from './MeetingOverlay';
import { useMeeting } from '../contexts/MeetingContext';

// Mock dependencies
vi.mock('lucide-react', () => ({ X: () => <svg data-testid="mock-x-icon" /> }));
vi.mock('../contexts/MeetingContext');
vi.mock('./MeetingScreen', () => ({
  default: () => <div data-testid="mock-meeting-screen" />,
}));

const mockUseMeeting = useMeeting as Mock;

describe('MeetingOverlay', () => {
  const mockDispatch = vi.fn();
  let mainElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    // The component searches for a <main> element to portal into.
    // We need to create one in the JSDOM environment for the test.
    mainElement = document.createElement('main');
    document.body.appendChild(mainElement);
  });

  afterEach(() => {
    // Clean up the created <main> element if it's still in the DOM
    if (mainElement.parentNode) {
      mainElement.parentNode.removeChild(mainElement);
    }
  });

  it('should not render when isMeetingUIVisible is false', () => {
    mockUseMeeting.mockReturnValue({
      state: { isMeetingUIVisible: false },
      dispatch: mockDispatch,
    });

    render(<MeetingOverlay />);
    expect(screen.queryByTestId('meeting-overlay')).not.toBeInTheDocument();
  });

  it('should render the overlay when isMeetingUIVisible is true', () => {
    mockUseMeeting.mockReturnValue({
      state: { isMeetingUIVisible: true },
      dispatch: mockDispatch,
    });

    render(<MeetingOverlay />);
    
    expect(screen.getByTestId('meeting-overlay')).toBeInTheDocument();
    expect(screen.getByText('Active Meeting')).toBeInTheDocument();
    expect(screen.getByTestId('mock-meeting-screen')).toBeInTheDocument();
    expect(screen.getByTestId('meeting-overlay-close')).toBeInTheDocument();
  });

  it('should dispatch END_MEETING when the close button is clicked', () => {
    mockUseMeeting.mockReturnValue({
      state: { isMeetingUIVisible: true },
      dispatch: mockDispatch,
    });

    render(<MeetingOverlay />);
    
    const closeButton = screen.getByTestId('meeting-overlay-close');
    fireEvent.click(closeButton);

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'END_MEETING' });
  });

  it('should not render if main element is not found, even if visible', () => {
    // Remove the main element for this specific test
    document.body.removeChild(mainElement);

    mockUseMeeting.mockReturnValue({
      state: { isMeetingUIVisible: true },
      dispatch: mockDispatch,
    });

    render(<MeetingOverlay />);
    expect(screen.queryByTestId('meeting-overlay')).not.toBeInTheDocument();
  });
});

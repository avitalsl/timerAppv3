import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import Header from './Header';
import type { User } from 'firebase/auth';
import { useCurrentUser } from '../contexts/UserContext';

// Mock child components
vi.mock('./TopBarMeetingButton', () => ({
  default: () => <div data-testid="mock-topbar-button"></div>,
}));

vi.mock('./UserAvatar', () => ({
  default: ({ user }: { user: User | null }) => (
    <div data-testid="mock-user-avatar">{user?.displayName}</div>
  ),
}));

// Mock the context hook
vi.mock('../contexts/UserContext', () => ({
  useCurrentUser: vi.fn(),
}));

// Cast the imported hook to a mock type
const mockUseCurrentUser = useCurrentUser as Mock;

describe('Header', () => {
  beforeEach(() => {
    mockUseCurrentUser.mockClear();
  });

  it('should render the header with the title', () => {
    // Arrange: Set up the mock return value for the hook
    const mockUser = { uid: '123', displayName: 'Test User', email: 'test@example.com' };
    mockUseCurrentUser.mockReturnValue(mockUser);

    // Act: Render the component
    render(<Header />);

    // Assert: Check that the title is rendered
    const titleElement = screen.getByText('Meeting Time Manager');
    expect(titleElement).toBeInTheDocument();

    // Assert: Check that mocks are rendered
    expect(screen.getByTestId('mock-topbar-button')).toBeInTheDocument();
    expect(screen.getByTestId('mock-user-avatar')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});

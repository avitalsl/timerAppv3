import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import UserAvatar from './UserAvatar';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { signInWithGoogle } from '../firebase';

// Mock the modules we need to control
vi.mock('firebase/auth');
vi.mock('../firebase');

// Cast the imported functions to mocks for type safety
const mockSignOut = signOut as Mock;
const mockSignInWithGoogle = signInWithGoogle as Mock;

describe('UserAvatar', () => {
  // A mock user object for testing the logged-in state
  const mockUser: User = {
    uid: '12345',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: null, 
    phoneNumber: null, 
    emailVerified: true, 
    isAnonymous: false, 
    metadata: {}, 
    providerData: [],
    providerId: 'google.com', 
    refreshToken: 'token', 
    tenantId: null, 
    delete: vi.fn(),
    getIdToken: vi.fn(), 
    getIdTokenResult: vi.fn(), 
    reload: vi.fn(), 
    toJSON: vi.fn(),
  };

  beforeEach(() => {
    // Clear mocks before each test to ensure isolation
    vi.clearAllMocks();
  });

  describe('When user is logged in', () => {
    it('should display user initials', () => {
      render(<UserAvatar user={mockUser} />);
      expect(screen.getByTestId('user-avatar-initials')).toHaveTextContent('TU');
    });

    it('should show and trigger logout on click', async () => {
      render(<UserAvatar user={mockUser} />);

      // Hover to show the button
      fireEvent.mouseEnter(screen.getByTestId('user-avatar-container'));

      // Find and click the logout button
      const logoutButton = await screen.findByTestId('user-avatar-button');
      expect(logoutButton).toHaveTextContent('Logout');
      fireEvent.click(logoutButton);

      // Assert signOut was called
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('When user is logged out', () => {
    it('should display empty initials', () => {
      render(<UserAvatar user={null} />);
      expect(screen.getByTestId('user-avatar-initials')).toHaveTextContent('');
    });

    it('should show and trigger login on click', async () => {
      render(<UserAvatar user={null} />);

      // Hover to show the button
      fireEvent.mouseEnter(screen.getByTestId('user-avatar-container'));

      // Find and click the login button
      const loginButton = await screen.findByTestId('user-avatar-button');
      expect(loginButton).toHaveTextContent('Login');
      fireEvent.click(loginButton);

      // Assert signInWithGoogle was called
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });
});

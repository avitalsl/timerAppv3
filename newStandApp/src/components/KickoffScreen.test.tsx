import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import KickoffScreen from './KickoffScreen';
import { kickoffSettingsStorageService } from '../services/kickoffSettingsStorageService';
import { useCurrentUser } from '../contexts/UserContext';
import type { KickoffSetting } from '../contexts/MeetingContext';
import type { User } from 'firebase/auth';

// Mock dependencies
vi.mock('../services/kickoffSettingsStorageService');
vi.mock('../contexts/UserContext');

// Cast mocks for type safety
const mockGetKickoffSettings = kickoffSettingsStorageService.getKickoffSettings as Mock;
const mockSaveKickoffSettings = kickoffSettingsStorageService.saveKickoffSettings as Mock;
const mockUseCurrentUser = useCurrentUser as Mock;

describe('KickoffScreen', () => {
  const mockUser: Partial<User> = {
    displayName: 'Test User',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the user context
    mockUseCurrentUser.mockReturnValue(mockUser);

    // Default mock for getting settings
    mockGetKickoffSettings.mockReturnValue({
      mode: 'getDownToBusiness',
      storyOption: null,
      storyDurationSeconds: undefined,
      storytellerName: '',
    } as KickoffSetting);

    // Mock for saving settings
    mockSaveKickoffSettings.mockReturnValue(true);
  });

  it('should render with default settings', () => {
    render(<KickoffScreen />);
    expect(screen.getByLabelText('Get Down to Business')).toBeChecked();
    expect(screen.getByLabelText('Story Time')).not.toBeChecked();
  });

  it('should switch to story time mode and save default settings', () => {
    render(<KickoffScreen />);
    const storyTimeRadio = screen.getByLabelText('Story Time');

    fireEvent.click(storyTimeRadio);

    expect(storyTimeRadio).toBeChecked();
    expect(screen.getByLabelText('Randomize Storyteller')).toBeChecked();
    
    // Check if save was called with the correct default story time settings
    expect(mockSaveKickoffSettings).toHaveBeenCalledWith({
      mode: 'storyTime',
      storyOption: 'random',
      storyDurationSeconds: 60, // Default duration
      storytellerName: '',
    });
  });

  it('should allow changing story time options and save them', () => {
    // Start in story time mode for this test
    mockGetKickoffSettings.mockReturnValue({
      mode: 'storyTime',
      storyOption: 'random',
      storyDurationSeconds: 60,
      storytellerName: '',
    } as KickoffSetting);

    render(<KickoffScreen />);

    // Switch to manual storyteller
    const manualRadio = screen.getByLabelText('Choose Storyteller');
    fireEvent.click(manualRadio);

    expect(manualRadio).toBeChecked();
    expect(screen.getByLabelText('Storyteller')).toBeInTheDocument();

    // Check if save was called correctly
    expect(mockSaveKickoffSettings).toHaveBeenCalledWith(expect.objectContaining({ storyOption: 'manual' }));

    // Change the storyteller name
    const nameInput = screen.getByLabelText('Storyteller');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(nameInput).toHaveValue('John Doe');
    expect(mockSaveKickoffSettings).toHaveBeenCalledWith(expect.objectContaining({ storytellerName: 'John Doe' }));
  });

  it('should clear story settings when switching back to getDownToBusiness mode', () => {
    mockGetKickoffSettings.mockReturnValue({
      mode: 'storyTime',
      storyOption: 'manual',
      storyDurationSeconds: 120,
      storytellerName: 'Jane Doe',
    } as KickoffSetting);

    render(<KickoffScreen />);

    const businessRadio = screen.getByLabelText('Get Down to Business');
    fireEvent.click(businessRadio);

    expect(businessRadio).toBeChecked();
    expect(screen.queryByLabelText('Storyteller')).not.toBeInTheDocument();

    // Check that settings are cleared on save
    expect(mockSaveKickoffSettings).toHaveBeenCalledWith({
      mode: 'getDownToBusiness',
      storyOption: null,
      storyDurationSeconds: undefined,
      storytellerName: '',
    });
  });
});

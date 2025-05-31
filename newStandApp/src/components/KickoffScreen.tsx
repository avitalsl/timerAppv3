import React, { useState, useEffect, useMemo } from 'react';
import { kickoffSettingsStorageService } from '../services/kickoffSettingsStorageService';
import type { KickoffSetting } from '../contexts/MeetingContext';

/**
 * KickoffScreen - Allows users to define how the meeting should start.
 */

const KickoffScreen: React.FC = () => {
  // Get initial settings from storage service
  const initialSettings = useMemo(() => {
    // Get settings using the storage service
    const settings = kickoffSettingsStorageService.getKickoffSettings();
    return settings;
  }, []);
  
  // Initialize state with values from storage service
  const [kickoffMode, setKickoffMode] = useState<'getDownToBusiness' | 'storyTime'>(initialSettings.mode);
  const [storyOption, setStoryOption] = useState<'random' | 'manual' | null>(initialSettings.storyOption);

  // Save settings to storage service when they change
  useEffect(() => {
    // Ensure story option is 'random' when in storyTime mode with null option
    let effectiveStoryOption = storyOption;
    if (kickoffMode === 'storyTime' && storyOption === null) {
      effectiveStoryOption = 'random';
    }

    // Prepare settings object to save
    const settingsToSave: KickoffSetting = {
      mode: kickoffMode,
      storyOption: kickoffMode === 'storyTime' ? effectiveStoryOption : null,
    };
    
    // Save settings and handle errors
    const success = kickoffSettingsStorageService.saveKickoffSettings(settingsToSave);
    if (!success) {
      console.error('[KickoffScreen] Failed to save kickoff settings');
    }
  }, [kickoffMode, storyOption]); // Only depend on the actual state values

  const handleKickoffModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value as 'getDownToBusiness' | 'storyTime';
    setKickoffMode(newMode);
    if (newMode === 'getDownToBusiness') {
      setStoryOption(null);
    } else if (newMode === 'storyTime' && !storyOption) {
      // Default to 'random' when switching to 'storyTime' if no option was previously selected
      setStoryOption('random');
    }
  };

  const handleStoryOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStoryOption(event.target.value as 'random' | 'manual');
  };

  return (
    <div data-testid="kickoff-screen-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500 mr-2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
          <h3 className="text-lg font-medium text-gray-700">Kickoff Settings</h3>
        </div>
      </div>

      {/* Kickoff Mode Selection */}
      <section className="mb-8" data-testid="kickoff-mode-selector">
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="kickoffMode"
              value="getDownToBusiness"
              checked={kickoffMode === 'getDownToBusiness'}
              onChange={handleKickoffModeChange}
              data-testid="kickoff-mode-getDownToBusiness"
            />
            <span className="text-sm text-gray-500">Get Down to Business</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="kickoffMode"
              value="storyTime"
              checked={kickoffMode === 'storyTime'}
              onChange={handleKickoffModeChange}
              data-testid="kickoff-mode-storyTime"
            />
            <span className="text-sm text-gray-500">Story Time</span>
          </label>
        </div>
      </section>

      {kickoffMode === 'storyTime' && (
        <section className="mb-8 transition-all duration-300 ease-in-out" data-testid="story-time-options-selector">
          <div className="flex gap-6 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="storyOption"
                value="random"
                checked={storyOption === 'random'}
                onChange={handleStoryOptionChange}
                data-testid="story-time-option-random"
              />
              <span className="text-sm text-gray-500">Randomize Storyteller</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="storyOption"
                value="manual"
                checked={storyOption === 'manual'}
                onChange={handleStoryOptionChange}
                data-testid="story-time-option-manual"
              />
              <span className="text-sm text-gray-500">Choose Storyteller</span>
            </label>
          </div>
        </section>
      )}
    </div>
  );
};

export default KickoffScreen;

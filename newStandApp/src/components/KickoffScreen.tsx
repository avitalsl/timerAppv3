import React, { useState, useEffect, useMemo } from 'react';
import { kickoffSettingsStorageService } from '../services/kickoffSettingsStorageService';
import type { KickoffSetting } from '../contexts/MeetingContext';

/**
 * KickoffScreen - Allows users to define how the meeting should start.
 */

const KickoffScreen: React.FC = () => {
  // Get initial settings from storage service
  const initialSettings = useMemo(() => {
    const settings = kickoffSettingsStorageService.getKickoffSettings();
    return settings;
  }, []);
  
  // Initialize state with values from storage service
  const [kickoffMode, setKickoffMode] = useState<'getDownToBusiness' | 'storyTime'>(initialSettings.mode);
  const [storyOption, setStoryOption] = useState<'random' | 'manual' | null>(initialSettings.storyOption);
  const [storyDurationSeconds, setStoryDurationSeconds] = useState<number | undefined>(
    initialSettings.storyDurationSeconds
  );
  const [storytellerName, setStorytellerName] = useState<string>(
    initialSettings.storytellerName || '' // Initialize from storage or default to empty string
  );

  // Save settings to storage service when they change
  useEffect(() => {
    let effectiveStoryOption = storyOption;
    if (kickoffMode === 'storyTime' && storyOption === null) {
      effectiveStoryOption = 'random'; // Default to random if storyTime is on but no option selected
    }

    let durationToSave = storyDurationSeconds;
    if (kickoffMode === 'storyTime') {
      if (typeof durationToSave !== 'number' || durationToSave <= 0) {
        durationToSave = 60; // Default to 60 if invalid or not set for storyTime
      }
    } else {
      durationToSave = undefined; // Ensure undefined for getDownToBusiness
    }

    // Determine storytellerName to save
    let nameToSave = storytellerName;
    if (kickoffMode !== 'storyTime' || effectiveStoryOption !== 'manual') {
      nameToSave = ''; // Clear storyteller name if not in manual story mode
    }

    const settingsToSave: KickoffSetting = {
      mode: kickoffMode,
      storyOption: kickoffMode === 'storyTime' ? effectiveStoryOption : null,
      storyDurationSeconds: durationToSave,
      storytellerName: nameToSave, // Add storytellerName to settings
    };
    
    const success = kickoffSettingsStorageService.saveKickoffSettings(settingsToSave);
    if (!success) {
      console.error('[KickoffScreen] Failed to save kickoff settings');
    }
  }, [kickoffMode, storyOption, storyDurationSeconds, storytellerName]); // Add storytellerName to dependencies

  const handleKickoffModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value as 'getDownToBusiness' | 'storyTime';
    setKickoffMode(newMode);
    if (newMode === 'getDownToBusiness') {
      setStoryOption(null);
      setStoryDurationSeconds(undefined);
      setStorytellerName(''); // Clear storyteller name
    } else if (newMode === 'storyTime') {
      // When switching to storyTime, ensure storyOption and duration are set if not already.
      if (!storyOption) { // if storyOption was null (from getDownToBusiness)
        setStoryOption('random'); // Default to random
      }
      if (typeof storyDurationSeconds !== 'number' || storyDurationSeconds <= 0) {
        setStoryDurationSeconds(60); // Default duration when switching to storyTime
      }
      // Storyteller name will be handled by storyOption change or remain as is if manual was already selected
    }
  };

  const handleStoryOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStoryOption = event.target.value as 'random' | 'manual';
    setStoryOption(newStoryOption);
    if (newStoryOption === 'random') {
      setStorytellerName(''); // Clear storyteller name if random is selected
    }
    // If 'manual' is selected, user will input name, no need to clear here
  };

  const handleStoryDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(event.target.value, 10);
    setStoryDurationSeconds(isNaN(newDuration) || newDuration <= 0 ? undefined : newDuration);
  };

  // New handler for storyteller name change
  const handleStorytellerNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStorytellerName(event.target.value);
    // Saving is now handled by the main useEffect
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
        <>
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

          {/* Flex container for duration and conditional storyteller name */}
          <div className="flex items-end space-x-4 mb-8">
            {/* Story Duration Input - always shown in storyTime mode */}
            <div data-testid="story-time-duration-selector">
              <label htmlFor="storyDurationInput" className="block text-sm font-medium text-gray-700 mb-1">
                Story Duration (seconds)
              </label>
              <input
                type="number"
                id="storyDurationInput"
                name="storyDurationSeconds"
                value={storyDurationSeconds === undefined || storyDurationSeconds <= 0 ? '' : storyDurationSeconds}
                onChange={handleStoryDurationChange}
                min="1"
                className="mt-1 block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                data-testid="story-duration-input"
                placeholder="e.g., 60"
              />
            </div>

            {/* Storyteller Name Input - conditionally shown within the flex container */}
            {storyOption === 'manual' && (
              <div className="transition-all duration-300 ease-in-out">
                <label htmlFor="storytellerNameInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Storyteller
                </label>
                <input
                  type="text"
                  id="storytellerNameInput"
                  name="storytellerName"
                  value={storytellerName}
                  onChange={handleStorytellerNameChange}
                  className="mt-1 block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  data-testid="story-teller-name-input" 
                  placeholder="Enter storyteller's name"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default KickoffScreen;

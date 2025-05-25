import React, { useState, useEffect } from 'react';

interface KickoffSetting {
  mode: 'getDownToBusiness' | 'storyTime';
  storyOption: 'random' | 'manual' | null;
}

const KICKOFF_SETTING_KEY = 'kickoffSetting';

/**
 * KickoffScreen - Allows users to define how the meeting should start.
 */
const KickoffScreen: React.FC = () => {
  const [kickoffMode, setKickoffMode] = useState<'getDownToBusiness' | 'storyTime'>('getDownToBusiness');
  const [storyOption, setStoryOption] = useState<'random' | 'manual' | null>(null);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    console.log('[KickoffScreen] Load effect: START');
    let finalKickoffMode: 'getDownToBusiness' | 'storyTime' = 'getDownToBusiness';
    let finalStoryOption: 'random' | 'manual' | null = null;

    const storedSettings = localStorage.getItem(KICKOFF_SETTING_KEY);
    console.log('[KickoffScreen] Load effect: storedSettings from localStorage:', storedSettings);
    if (storedSettings) {
      try {
        const parsedSettings: KickoffSetting = JSON.parse(storedSettings);
        console.log('[KickoffScreen] Load effect: parsedSettings:', parsedSettings);
        finalKickoffMode = parsedSettings.mode;
        finalStoryOption = parsedSettings.storyOption;
        if (finalKickoffMode === 'storyTime' && finalStoryOption === null) {
          finalStoryOption = 'random'; 
          console.log('[KickoffScreen] Load effect: Defaulted storyOption to random');
        }
      } catch (error) {
        console.error('[KickoffScreen] Load effect: Error parsing kickoff settings:', error);
      }
    }
    console.log(`[KickoffScreen] Load effect: Setting state - kickoffMode: ${finalKickoffMode}, storyOption: ${finalStoryOption}`);
    setKickoffMode(finalKickoffMode);
    setStoryOption(finalStoryOption);
    setIsLoadedFromStorage(true); 
    console.log('[KickoffScreen] Load effect: END, isLoadedFromStorage set to true');
  }, []); // Empty dependency array: runs once on mount

  // Save settings to localStorage when they change, but only after initial load attempt
  useEffect(() => {
    console.log(`[KickoffScreen] Save effect: START - isLoaded: ${isLoadedFromStorage}, mode: ${kickoffMode}, option: ${storyOption}`);
    if (!isLoadedFromStorage) {
      console.log('[KickoffScreen] Save effect: SKIPPING (not loaded from storage yet)');
      return; 
    }
    
    let effectiveStoryOption = storyOption;
    if (kickoffMode === 'storyTime' && storyOption === null) {
      effectiveStoryOption = 'random';
      console.log('[KickoffScreen] Save effect: Defaulted effectiveStoryOption to random for saving');
    }

    const settingsToSave: KickoffSetting = {
      mode: kickoffMode,
      storyOption: kickoffMode === 'storyTime' ? effectiveStoryOption : null,
    };
    console.log('[KickoffScreen] Save effect: Saving to localStorage:', settingsToSave);
    localStorage.setItem(KICKOFF_SETTING_KEY, JSON.stringify(settingsToSave));
    console.log('[KickoffScreen] Save effect: END');
  }, [kickoffMode, storyOption, isLoadedFromStorage]); // Add isLoadedFromStorage to ensure save after load

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
    <div className="bg-white rounded-lg shadow-md p-6" data-testid="kickoff-screen-card">
      <h2 className="text-xl font-semibold mb-4">Kickoff Settings</h2>

      <div className="mb-6" data-testid="kickoff-mode-selector">
        <label className="block text-gray-700 text-sm font-bold mb-2">How should the meeting start?</label>
        <div>
          <label className="inline-flex items-center mr-6">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name="kickoffMode"
              value="getDownToBusiness"
              checked={kickoffMode === 'getDownToBusiness'}
              onChange={handleKickoffModeChange}
              data-testid="kickoff-mode-getDownToBusiness"
            />
            <span className="ml-2">Get Down to Business</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name="kickoffMode"
              value="storyTime"
              checked={kickoffMode === 'storyTime'}
              onChange={handleKickoffModeChange}
              data-testid="kickoff-mode-storyTime"
            />
            <span className="ml-2">Story Time</span>
          </label>
        </div>
      </div>

      {kickoffMode === 'storyTime' && (
        <div className="mb-4 transition-all duration-300 ease-in-out" data-testid="story-time-options-selector">
          <label className="block text-gray-700 text-sm font-bold mb-2">Choose storyteller method:</label>
          <div>
            <label className="inline-flex items-center mr-6">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="storyOption"
                value="random"
                checked={storyOption === 'random'}
                onChange={handleStoryOptionChange}
                data-testid="story-time-option-random"
              />
              <span className="ml-2">Randomize Storyteller</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="storyOption"
                value="manual"
                checked={storyOption === 'manual'}
                onChange={handleStoryOptionChange}
                data-testid="story-time-option-manual"
              />
              <span className="ml-2">Choose Storyteller</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default KickoffScreen;

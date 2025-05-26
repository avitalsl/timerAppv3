import React, { useState, useEffect } from 'react';

interface KickoffSetting {
  mode: 'getDownToBusiness' | 'storyTime';
  storyOption: 'random' | 'manual' | null;
}

const KICKOFF_SETTING_KEY = 'kickoffSetting';

/**
 * KickoffScreen - Allows users to define how the meeting should start.
 */
// Function to get initial kickoff settings from localStorage
const getInitialKickoffSettings = (): { mode: 'getDownToBusiness' | 'storyTime'; storyOption: 'random' | 'manual' | null } => {
  console.log('[KickoffScreen] Getting initial kickoff settings');
  try {
    const storedSettings = localStorage.getItem(KICKOFF_SETTING_KEY);
    console.log('[KickoffScreen] storedSettings from localStorage:', storedSettings);
    if (storedSettings) {
      const parsedSettings: KickoffSetting = JSON.parse(storedSettings);
      console.log('[KickoffScreen] parsedSettings:', parsedSettings);
      let finalStoryOption = parsedSettings.storyOption;
      
      // Ensure storyOption is valid when mode is storyTime
      if (parsedSettings.mode === 'storyTime' && finalStoryOption === null) {
        finalStoryOption = 'random';
        console.log('[KickoffScreen] Defaulted storyOption to random');
      }
      
      return {
        mode: parsedSettings.mode,
        storyOption: finalStoryOption
      };
    }
  } catch (error) {
    console.error('[KickoffScreen] Error parsing kickoff settings:', error);
  }
  
  // Default settings if localStorage is empty or invalid
  return {
    mode: 'getDownToBusiness',
    storyOption: null
  };
};

const KickoffScreen: React.FC = () => {
  // Get initial settings from localStorage
  const initialSettings = React.useMemo(() => getInitialKickoffSettings(), []);
  
  // Initialize state with values from localStorage
  const [kickoffMode, setKickoffMode] = useState<'getDownToBusiness' | 'storyTime'>(initialSettings.mode);
  const [storyOption, setStoryOption] = useState<'random' | 'manual' | null>(initialSettings.storyOption);

  // Save settings to localStorage when they change
  useEffect(() => {
    console.log(`[KickoffScreen] Save effect: START - mode: ${kickoffMode}, option: ${storyOption}`);
    
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
    <div className="bg-white rounded-lg shadow-md p-6 max-w-[1200px] mx-auto" data-testid="kickoff-screen-card">
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

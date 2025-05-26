/**
 * TimerSetup component placeholder.
 * Implement your timer setup UI here.
 */
import React, { useState } from 'react';
import { Clock1Icon } from 'lucide-react';

/**
 * TimerSetup component allows users to configure meeting timer settings.
 */
const TIMER_SETUP_STORAGE_KEY = 'timerSetupConfig';

// Function to get initial state from localStorage
function getInitialState() {
  try {
    const raw = localStorage.getItem(TIMER_SETUP_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      console.log('[TimerSetup] Loading initial state from localStorage:', saved);
      return {
        mode: saved.mode === 'fixed' || saved.mode === 'per-participant' ? saved.mode : 'fixed',
        totalDuration: typeof saved.totalDurationMinutes === 'number' ? saved.totalDurationMinutes : 15,
        perParticipant: typeof saved.durationPerParticipantSeconds === 'number' ? saved.durationPerParticipantSeconds : 
                       typeof saved.perParticipantMinutes === 'number' ? saved.perParticipantMinutes * 60 : 60,
        allowExtension: typeof saved.allowExtension === 'boolean' ? saved.allowExtension : false,
        extensionAmount: typeof saved.extensionAmountSeconds === 'number' ? saved.extensionAmountSeconds : 
                        typeof saved.extensionAmountMinutes === 'number' ? saved.extensionAmountMinutes * 60 : 60
      };
    }
  } catch (e) {
    console.error('[TimerSetup] Error loading initial state from localStorage:', e);
  }
  
  // Default state if localStorage is empty or invalid
  return {
    mode: 'fixed',
    totalDuration: 15,
    perParticipant: 60,
    allowExtension: false,
    extensionAmount: 60
  };
}

const TimerSetup: React.FC = () => {
  // Get initial state from localStorage
  const initialState = React.useMemo(() => getInitialState(), []);
  
  // State for timer mode
  const [mode, setMode] = useState<'fixed' | 'per-participant'>(initialState.mode);
  const [totalDuration, setTotalDuration] = useState<number>(initialState.totalDuration); // in minutes
  const [perParticipant, setPerParticipant] = useState<number>(initialState.perParticipant); // in seconds
  const [allowExtension, setAllowExtension] = useState<boolean>(initialState.allowExtension);
  const [extensionAmount, setExtensionAmount] = useState<number>(initialState.extensionAmount); // in seconds

  // We no longer need to load from localStorage on mount since we initialize with the correct values

  // Save preferences to localStorage when state changes
  React.useEffect(() => {
    const config = {
      mode,
      totalDurationMinutes: mode === 'fixed' ? totalDuration : undefined,
      // Store per-participant time in seconds
      durationPerParticipantSeconds: mode === 'per-participant' ? perParticipant : undefined,
      allowExtension,
      // Store extension amount in seconds
      extensionAmountSeconds: allowExtension ? extensionAmount : undefined,
    };
    try {
      console.log('[TimerSetup] Saving to localStorage:', config);
      localStorage.setItem(TIMER_SETUP_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('[TimerSetup] Error saving to localStorage:', e);
      // Ignore errors
    }
  }, [mode, totalDuration, perParticipant, allowExtension, extensionAmount]);
  
  // Validation (simple)
  const isValidDuration = (val: number) => val > 0 && Number.isFinite(val);
  const isValidExtension = (val: number) => val > 0 && Number.isFinite(val);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-[1200px] mx-auto" data-testid="screen-timer-setup">
      <div className="flex items-center justify-between mb-3">
  <div className="flex items-center">
    <Clock1Icon className="h-5 w-5 text-gray-500 mr-2" />
    <h2 className="text-lg font-medium text-gray-700">Timer Setup</h2>
  </div>
</div>

      {/* Timer Mode Selection */}
      <section className="mb-8" data-testid="timer-mode-section">

        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="timer-mode"
              value="fixed"
              checked={mode === 'fixed'}
              onChange={() => setMode('fixed')}
              data-testid="timer-mode-fixed"
            />
            <span className="text-sm text-gray-500">Fixed meeting time</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="timer-mode"
              value="per-participant"
              checked={mode === 'per-participant'}
              onChange={() => setMode('per-participant')}
              data-testid="timer-mode-per-participant"
            />
            <span className="text-sm text-gray-500">Per participant</span>
          </label>
        </div>
        {mode === 'fixed' ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="total-duration" className="text-sm text-gray-500">Total meeting duration (minutes)</label>
            <input
              id="total-duration"
              type="number"
              min={1}
              value={totalDuration}
              onChange={e => setTotalDuration(Number(e.target.value))}
              className="border rounded px-2 py-1 w-32"
              data-testid="input-total-duration"
            />
            {!isValidDuration(totalDuration) && (
              <span className="text-red-500 text-xs">Enter a valid duration</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label htmlFor="per-participant" className="text-sm text-gray-500">Time per participant (seconds)</label>
            <input
              id="per-participant"
              type="number"
              min={1}
              value={perParticipant}
              onChange={e => setPerParticipant(Number(e.target.value))}
              className="border rounded px-2 py-1 w-32"
              data-testid="input-per-participant"
            />
            {!isValidDuration(perParticipant) && (
              <span className="text-red-500 text-xs">Enter a valid time per participant</span>
            )}
          </div>
        )}
      </section>

      {/* Enable Time Extension */}
      <section className="mb-8" data-testid="time-extension-section">
        <label className="flex items-center gap-2 mb-2 text-sm text-gray-500">
          <input
            type="checkbox"
            checked={allowExtension}
            onChange={e => setAllowExtension(e.target.checked)}
            data-testid="toggle-allow-extension"
          />
          Allow adding time during the meeting
        </label>
        {allowExtension && (
          <div className="flex flex-col gap-1 ml-6 mt-2">
            <label htmlFor="extension-amount" className="text-sm text-gray-500">
              {mode === 'per-participant'
                ? 'Time added per participant (seconds)'
                : 'Time added to meeting (seconds)'}
            </label>
            <input
              id="extension-amount"
              type="number"
              min={1}
              value={extensionAmount}
              onChange={e => setExtensionAmount(Number(e.target.value))}
              className="border rounded px-2 py-1 w-32"
              data-testid="input-extension-amount"
            />
            {!isValidExtension(extensionAmount) && (
              <span className="text-red-500 text-xs">Enter a valid extension amount</span>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default TimerSetup;

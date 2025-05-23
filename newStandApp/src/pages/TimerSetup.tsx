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

const TimerSetup: React.FC = () => {
  // State for timer mode
  const [mode, setMode] = useState<'fixed' | 'per-participant'>('fixed');
  const [totalDuration, setTotalDuration] = useState<number>(15); // in minutes
  const [perParticipant, setPerParticipant] = useState<number>(1); // in minutes
  const [allowExtension, setAllowExtension] = useState<boolean>(false);
  const [extensionAmount, setExtensionAmount] = useState<number>(1); // in minutes

  // Load preferences from localStorage on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(TIMER_SETUP_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.mode === 'fixed' || saved.mode === 'per-participant') setMode(saved.mode);
        if (typeof saved.totalDurationMinutes === 'number') setTotalDuration(saved.totalDurationMinutes);
        if (typeof saved.perParticipantMinutes === 'number') setPerParticipant(saved.perParticipantMinutes);
        if (typeof saved.allowExtension === 'boolean') setAllowExtension(saved.allowExtension);
        if (typeof saved.extensionAmountMinutes === 'number') setExtensionAmount(saved.extensionAmountMinutes);
      }
    } catch (e) {
      // Ignore errors
    }
  }, []);

  // Save preferences to localStorage when state changes
  React.useEffect(() => {
    const config = {
      mode,
      totalDurationMinutes: mode === 'fixed' ? totalDuration : undefined,
      perParticipantMinutes: mode === 'per-participant' ? perParticipant : undefined,
      allowExtension,
      extensionAmountMinutes: allowExtension ? extensionAmount : undefined,
    };
    try {
      localStorage.setItem(TIMER_SETUP_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      // Ignore errors
    }
  }, [mode, totalDuration, perParticipant, allowExtension, extensionAmount]);
  
  // Validation (simple)
  const isValidDuration = (val: number) => val > 0 && Number.isFinite(val);
  const isValidExtension = (val: number) => val > 0 && Number.isFinite(val);

  return (
    <div className="bg-white rounded-lg shadow-md p-6" data-testid="screen-timer-setup">
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
            <label htmlFor="per-participant" className="text-sm text-gray-500">Time per participant ({mode === 'per-participant' ? 'seconds' : 'minutes'})</label>
            <input
              id="per-participant"
              type="number"
              min={1}
              value={mode === 'per-participant' ? perParticipant * 60 : perParticipant}
              onChange={e => setPerParticipant(mode === 'per-participant' ? Number(e.target.value) / 60 : Number(e.target.value))}
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
                : 'Time added to meeting (minutes)'}
            </label>
            <input
              id="extension-amount"
              type="number"
              min={1}
              value={mode === 'per-participant' ? extensionAmount * 60 : extensionAmount}
              onChange={e => setExtensionAmount(mode === 'per-participant' ? Number(e.target.value) / 60 : Number(e.target.value))}
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

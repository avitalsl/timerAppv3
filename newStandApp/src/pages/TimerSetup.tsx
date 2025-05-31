/**
 * TimerSetup component for configuring meeting timer settings.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Clock1Icon } from 'lucide-react';
import { timerConfigStorageService } from '../services/timerConfigStorageService';
import type { StoredTimerConfig } from '../contexts/MeetingContext';

const TimerSetup: React.FC = () => {
  // Get initial timer config from storage service
  const initialConfig = useMemo(() => {
    const config = timerConfigStorageService.getTimerConfig();
    
    // Map the stored config to component state
    return {
      mode: config.mode,
      totalDuration: config.totalDurationMinutes || 15,
      perParticipant: config.durationPerParticipantSeconds || 60,
      allowExtension: config.allowExtension,
      extensionAmount: config.extensionAmountSeconds || 60
    };
  }, []);
  
  // State for timer mode
  const [mode, setMode] = useState<'fixed' | 'per-participant'>(initialConfig.mode);
  const [totalDuration, setTotalDuration] = useState<number>(initialConfig.totalDuration); // in minutes
  const [perParticipant, setPerParticipant] = useState<number>(initialConfig.perParticipant); // in seconds
  const [allowExtension, setAllowExtension] = useState<boolean>(initialConfig.allowExtension);
  const [extensionAmount, setExtensionAmount] = useState<number>(initialConfig.extensionAmount); // in seconds

  // Save preferences to storage service when state changes
  useEffect(() => {
    const config: StoredTimerConfig = {
      mode,
      totalDurationMinutes: mode === 'fixed' ? totalDuration : undefined,
      // Store per-participant time in seconds
      durationPerParticipantSeconds: mode === 'per-participant' ? perParticipant : undefined,
      allowExtension,
      // Store extension amount in seconds
      extensionAmountSeconds: allowExtension ? extensionAmount : undefined,
    };
    
    const success = timerConfigStorageService.saveTimerConfig(config);
    
    if (!success) {
      console.error('[TimerSetup] Error saving to storage service');
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

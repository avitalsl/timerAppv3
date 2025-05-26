/**
 * Participants page placeholder component.
 * Replace this with participant management features.
 */
import React, { useState } from 'react';

const Participants: React.FC = () => {
  interface Participant {
  name: string;
  included: boolean;
}

const initialNames = ['Avital', 'Asaf', 'Yair', 'Eitan', 'Tal', 'Rotem', 'Yonatan'];
const localStorageKey = 'participantsList';
const PARTICIPANT_LIST_VISIBILITY_KEY = 'participantListVisibilityMode';

// Get initial participants from localStorage or use defaults
const getInitialParticipants = (): Participant[] => {
  const stored = localStorage.getItem(localStorageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every(p => typeof p.name === 'string' && typeof p.included === 'boolean')) {
        return parsed;
      }
    } catch {}
  }
  return initialNames.map(name => ({ name, included: false }));
};

// Get initial visibility mode from localStorage or use default
const getInitialVisibilityMode = (): 'all_visible' | 'focus_speaker' => {
  try {
    const storedMode = localStorage.getItem(PARTICIPANT_LIST_VISIBILITY_KEY);
    if (storedMode === 'focus_speaker' || storedMode === 'all_visible') {
      return storedMode;
    }
  } catch (e) {
    console.error('[Participants] Error loading visibility mode from localStorage:', e);
  }
  return 'all_visible';
};

const [participants, setParticipants] = useState<Participant[]>(getInitialParticipants());
const [listVisibilityMode, setListVisibilityMode] = useState<'all_visible' | 'focus_speaker'>(getInitialVisibilityMode());

// Save to localStorage whenever participants changes
React.useEffect(() => {
  localStorage.setItem(localStorageKey, JSON.stringify(participants));
}, [participants]);

  // We no longer need to load from localStorage on mount since we initialize with the correct values

  React.useEffect(() => {
    localStorage.setItem(PARTICIPANT_LIST_VISIBILITY_KEY, listVisibilityMode);
  }, [listVisibilityMode]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const handleVisibilityModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListVisibilityMode(e.target.checked ? 'focus_speaker' : 'all_visible');
  };

  // Filter participants by search term (case-insensitive substring)
  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const handleAdd = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setError('Name cannot be empty');
      return;
    }
    if (participants.some(p => p.name === trimmed)) {
      setError('Participant already exists');
      return;
    }
    setParticipants([...participants, { name: trimmed, included: true }]);
    setSearchTerm('');
    setError('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-[1200px] mx-auto" data-testid="screen-participants">
      <div className="flex items-center mb-6"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" /></svg><h2 className="text-lg font-medium text-gray-700">Participants</h2></div>
      <div className="flex gap-2 mb-4" data-testid="participants-add-section">
        <input
          type="text"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setError('');
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Enter participant name"
          className="border rounded px-2 py-1 max-w-[900px]"
          data-testid="input-participant-name"
        />
        <button
          onClick={handleAdd}
          className="bg-primary-medium text-primary-lightText px-4 py-1 rounded hover:bg-primary-secondaryButtonColorHover font-bold"
          data-testid="btn-add-participant"
          disabled={!searchTerm.trim()}
        >
          Add
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mb-2" data-testid="error-message">{error}</div>}

      {/* Participant List Visibility Setting */}
      <div className="my-6 p-4 border border-gray-200 rounded-md bg-gray-50" data-testid="participant-visibility-config-section">
        <h4 className="text-md font-medium text-gray-700 mb-2">Meeting View Options</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={listVisibilityMode === 'focus_speaker'}
            onChange={handleVisibilityModeChange}
            className="h-4 w-4 text-primary-medium focus:ring-primary-medium border-gray-300 rounded"
            data-testid="checkbox-focus-speaker"
          />
          <span className="text-sm text-gray-600">Focus on current speaker (blur others during meeting)</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          If checked, only the current speaker will be clearly visible in the participant list during the meeting. Others will be blurred.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid="participants-columns">
        {/* Selected Participants */}
        <div>
          <h3 className="text-lg font-medium text-gray-700">Selected Participants</h3>
          <ul className="space-y-2 bg-white rounded py-3 px-0 min-h-[120px] max-w-[480px]" data-testid="selected-participants-list">
            {(participants.filter(p => p.included).length === 0) ? (
              <li className="text-gray-400 text-center">No participants selected.</li>
            ) : (
              participants.filter(p => p.included).map((participant) => (
                <li key={participant.name} className="flex items-center gap-2 bg-primary-sandLight border-2 border-primary-sandLight px-3 py-1 rounded justify-between">
                  <span className="text-sm font-medium text-gray-700">{participant.name}</span>
                  <button
                    className="w-5 h-5 flex items-center justify-center text-xs rounded-full p-0 hover:bg-primary-sand focus:outline-none"
                    style={{fontSize: '0.75rem', lineHeight: 1, color: 'hsl(0, 75%, 85%)'}}
                    onClick={() => setParticipants(participants.map(p => p.name === participant.name ? { ...p, included: false } : p))}
                    data-testid={`btn-remove-selected-${participant.name}`}
                    aria-label={`Remove ${participant.name}`}
                  >
                    x
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
        {/* Optional Participants */}
        <div>
          <h3 className="text-lg font-medium text-gray-700">Optional Participants</h3>
          <ul className="space-y-2 bg-white rounded py-3 px-0 min-h-[120px] max-w-[480px]" data-testid="optional-participants-list">
            {(filteredParticipants.filter(p => !p.included).length === 0) ? (
              <li className="text-gray-400 text-center">No optional participants left.</li>
            ) : (
              filteredParticipants.filter(p => !p.included).map(participant => (
                <li key={participant.name} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded justify-between">
                  <span className="text-sm font-medium text-gray-700">{participant.name}</span>
                  <button
                    className="text-xs bg-primary-sandLight border-2 border-primary-sand text-gray-700 rounded px-2 py-0.5 hover:bg-primary-sand"
                    onClick={() => {
  setParticipants(participants.map(p => p.name === participant.name ? { ...p, included: true } : p));
  setSearchTerm('');
}}
                    data-testid={`btn-add-optional-${participant.name}`}
                  >
                    Add
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Participants;

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

const [participants, setParticipants] = useState<Participant[]>(getInitialParticipants());

// Save to localStorage whenever participants changes
React.useEffect(() => {
  localStorage.setItem(localStorageKey, JSON.stringify(participants));
}, [participants]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Name cannot be empty');
      return;
    }
    if (participants.some(p => p.name === trimmed)) {
      setError('Participant already exists');
      return;
    }
    setParticipants([...participants, { name: trimmed, included: true }]);
    setNewName('');
    setError('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="max-w-xl mx-auto p-8" data-testid="screen-participants">
      <h2 className="text-2xl font-semibold mb-6 text-center">Participants</h2>
      <div className="flex gap-2 mb-4" data-testid="participants-add-section">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Enter participant name"
          className="border rounded px-2 py-1 flex-1"
          data-testid="input-participant-name"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          data-testid="btn-add-participant"
        >
          Add
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mb-2" data-testid="error-message">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6" data-testid="participants-columns">
        {/* Selected Participants */}
        <div>
          <h3 className="font-semibold mb-2 text-center">Selected Participants</h3>
          <ul className="space-y-2 border rounded p-3 min-h-[120px]" data-testid="selected-participants-list">
            {participants.filter(p => p.included).length === 0 ? (
              <li className="text-gray-400 text-center">No participants selected.</li>
            ) : (
              participants.filter(p => p.included).map((participant) => (
                <li key={participant.name} className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded justify-between">
                  <span className="text-gray-700">{participant.name}</span>
                  <button
                    className="w-5 h-5 flex items-center justify-center text-xs bg-red-300 text-white rounded-full p-0 hover:bg-red-400 focus:outline-none"
                    style={{fontSize: '0.75rem', lineHeight: 1}}
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
          <h3 className="font-semibold mb-2 text-center">Optional Participants</h3>
          <ul className="space-y-2 border rounded p-3 min-h-[120px]" data-testid="optional-participants-list">
            {participants.filter(p => !p.included).length === 0 ? (
              <li className="text-gray-400 text-center">No optional participants left.</li>
            ) : (
              participants.filter(p => !p.included).map(participant => (
                <li key={participant.name} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded justify-between">
                  <span className="text-gray-700">{participant.name}</span>
                  <button
                    className="text-xs bg-blue-500 text-white rounded px-2 py-0.5 hover:bg-blue-600"
                    onClick={() => setParticipants(participants.map(p => p.name === participant.name ? { ...p, included: true } : p))}
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

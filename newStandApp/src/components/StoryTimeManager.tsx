import React from 'react';
import { useMeeting } from '../contexts/MeetingContext';
import type { Participant } from '../contexts/MeetingContext'; // Assuming Participant type is exported

interface StoryTimeManagerProps {
  // Props will be defined later as the feature is developed
}

/**
 * StoryTimeManager - Component to manage the Story Time kickoff phase.
 * This component will handle:
 * - Displaying the storyteller (if manually chosen or randomly selected).
 * - Potentially providing controls for the storyteller or to advance past story time.
 */
const StoryTimeManager: React.FC<StoryTimeManagerProps> = () => {
  const { state } = useMeeting();
  const { kickoffSettings, participants } = state;

  // If story time is not active, render nothing
  if (kickoffSettings?.mode !== 'storyTime') {
    return null;
  }

  // Placeholder for storyteller selection logic
  let storyteller: Participant | null = null;

  // Story time mode is confirmed by the check above, now check for participants
  if (participants.length > 0) { 
    // Use all participants, regardless of type
    if (kickoffSettings.storyOption === 'random') {
      // Random selection from all participants
      const randomIndex = Math.floor(Math.random() * participants.length);
      storyteller = participants[randomIndex];
    } else if (kickoffSettings.storyOption === 'manual') {
      // Manual selection - pick the first participant
      storyteller = participants[0];
    }
  }

  return (
    <div data-testid="story-time-manager" className="p-4 bg-gray-100 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Story Time!</h2>
      <div data-testid="story-time-active-content">
        {storyteller ? (
          <p data-testid="story-teller-announcement" className="text-gray-600">
            Our storyteller is: <span className="font-medium">{storyteller.name}</span>!
          </p>
        ) : (
          <p data-testid="story-teller-pending" className="text-gray-600">
            Waiting to determine the storyteller (or no participants available)...
          </p>
        )}
        {/* Additional UI for story time controls can be added here */}
      </div>
    </div>
  );
};

export default StoryTimeManager;
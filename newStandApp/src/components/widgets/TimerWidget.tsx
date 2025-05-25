import React from 'react';
import { PlayIcon, PauseIcon, RefreshCwIcon, SkipForwardIcon } from 'lucide-react';
import { useMeeting } from '../../contexts/MeetingContext';

const TimerWidget: React.FC = () => {
  const { state, dispatch } = useMeeting();
  const {
    currentTimeSeconds,
    timerStatus,
    isMeetingActive,
    timerConfig,
    participants,
    currentParticipantIndex,
  } = state;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG and progress bar constants
  const radius = 80;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  let initialDurationOfSegment = 0;
  if (timerConfig) {
    // The timerConfig.durationSeconds already holds the correct duration 
    // for the current segment, whether it's 'fixed' total time or 'per-participant' time.
    initialDurationOfSegment = timerConfig.durationSeconds || 0;
  }

  let progressRatio = 0;
  if (initialDurationOfSegment > 0) {
    if (timerStatus === 'finished') {
      progressRatio = 1;
    } else if (timerStatus === 'idle') {
      // When idle, currentTimeSeconds usually holds the full configured duration
      // So, (initial - current) / initial would be 0, meaning 0 progress.
      progressRatio = 0;
    } else { // 'running' or 'paused'
      progressRatio = (initialDurationOfSegment - currentTimeSeconds) / initialDurationOfSegment;
    }
  }
  progressRatio = Math.max(0, Math.min(1, progressRatio)); // Clamp between 0 and 1

  const offset = circumference * (1 - progressRatio);

  const handleTogglePlayPause = () => {
    if (!isMeetingActive) return;
    if (timerStatus === 'running') {
      dispatch({ type: 'PAUSE_TIMER' });
    } else if (timerStatus === 'paused' || timerStatus === 'idle') {
      // If idle, assume it means start the timer for current segment
      // This might need alignment with how START_MEETING works
      dispatch({ type: 'RESUME_TIMER' }); // Or a specific 'START_CURRENT_SEGMENT_TIMER'
    }
  };

  const handleNextParticipant = () => {
    if (isMeetingActive && timerConfig?.mode === 'per-participant') {
      dispatch({ type: 'NEXT_PARTICIPANT' });
    }
  };

  const isPlayPauseDisabled = !isMeetingActive || timerStatus === 'finished';
  const isNextParticipantMode = isMeetingActive && timerConfig?.mode === 'per-participant';
  const isNextParticipantDisabled = 
    !isNextParticipantMode || 
    currentParticipantIndex === null || 
    currentParticipantIndex >= participants.length - 1 ||
    timerStatus === 'finished';

  return (
    <div 
      className="flex flex-col h-full items-center justify-center p-4"
      data-testid="layout-component-timer"
    >
      <div 
        className="relative w-3/4 aspect-square shadow-xl rounded-full"
        data-testid="timer-circular-display"
      >
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* White background circle for the timer area */}
          <circle cx="100" cy="100" r="90" className="fill-white" />

          {/* Track for the progress bar */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            className="stroke-primary-sandLight"
            strokeWidth={strokeWidth}
            data-testid="timer-circular-track-arc"
          />
          {/* Progress arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            className="stroke-primary-buttonColor transition-all duration-300 ease-linear"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            strokeLinecap="round"
            data-testid="timer-circular-progress-arc"
          />
          {/* Time text */}
          <text
            x="50%"
            y="50%"
            dy=".3em" // Vertical alignment adjustment
            textAnchor="middle"
            className="fill-primary-dark font-bold"
            fontSize="40" // Adjusted for SVG viewBox
            data-testid="timer-circular-time-text"
          >
            {formatTime(currentTimeSeconds)}
          </text>
        </svg>
      </div>

      <div className="flex justify-center space-x-4 mt-8" data-testid="timer-controls">
        <button
          onClick={handleTogglePlayPause}
          className="p-3 rounded-full bg-white hover:bg-primary-sandLight disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
          disabled={isPlayPauseDisabled}
          aria-label={timerStatus === 'running' ? 'Pause timer' : 'Play timer'}
          data-testid="timer-play-pause-button"
        >
          {timerStatus === 'running' ? (
            <PauseIcon className="h-6 w-6 text-primary-medium" />
          ) : (
            <PlayIcon className="h-6 w-6 text-primary-medium" />
          )}
        </button>
        
        {isNextParticipantMode ? (
          <button
            onClick={handleNextParticipant}
            className="p-3 rounded-full bg-white hover:bg-primary-sandLight disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            disabled={isNextParticipantDisabled}
            aria-label="Next participant"
            data-testid="timer-next-reset-button" // Keeping same testid, though function might differ
          >
            <SkipForwardIcon className="h-6 w-6 text-primary-medium" />
          </button>
        ) : (
          // Optional: Show a Reset button if not in per-participant mode, or hide it
          // For now, keeping a disabled-like button for consistency if needed
          <button
            className="p-3 rounded-full bg-white hover:bg-primary-sandLight opacity-50 cursor-not-allowed shadow-md"
            disabled={true} 
            aria-label="Reset timer (disabled)"
            data-testid="timer-next-reset-button" 
          >
            <RefreshCwIcon className="h-6 w-6 text-primary-medium" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TimerWidget;

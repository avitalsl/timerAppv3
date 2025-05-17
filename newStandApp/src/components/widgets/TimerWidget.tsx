import React, { useState } from 'react';
import { Clock1Icon, PlayIcon, PauseIcon, RefreshCwIcon } from 'lucide-react';

const TimerWidget: React.FC = () => {
  const [time, setTime] = useState(15 * 60); // 15 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTime(15 * 60);
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-full" data-testid="layout-component-timer">
      <div className="flex items-center justify-center flex-grow" data-testid="timer-display">
        <Clock1Icon className="h-5 w-5 text-gray-500 mr-2" />
        <span className="text-2xl font-bold">{formatTime(time)}</span>
      </div>
      <div className="flex justify-center space-x-2 mt-2" data-testid="timer-controls">
        <button
          onClick={toggleTimer}
          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          {isRunning ? (
            <PauseIcon className="h-5 w-5 text-gray-700" />
          ) : (
            <PlayIcon className="h-5 w-5 text-gray-700" />
          )}
        </button>
        <button
          onClick={resetTimer}
          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <RefreshCwIcon className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default TimerWidget;

import React, { useEffect, useState } from 'react'
import {
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
  MicIcon,
  UserIcon,
  ChevronRightIcon,
} from 'lucide-react'

const MeetingScreen = () => {
  const [isRunning, setIsRunning] = useState(true)
  const [currentTime, setCurrentTime] = useState(120) // 2 minutes in seconds
  const [currentSpeaker, setCurrentSpeaker] = useState('John Doe')
  const [nextSpeaker, setNextSpeaker] = useState('Jane Smith')

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRunning && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (currentTime === 0) {
      setIsRunning(false)
    }
    return () => clearInterval(interval)
  }, [isRunning, currentTime])

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const skipToNext = () => {
    setCurrentTime(120)
    setCurrentSpeaker(nextSpeaker)
    setNextSpeaker('Mike Johnson')
    setIsRunning(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="screen-meeting">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#1a2a42]">Daily Standup</h2>
            <div className="text-sm text-gray-500">Total: 15:00 min</div>
          </div>
          <div className="flex flex-col items-center mb-8">
            <div 
              className="w-48 h-48 rounded-full bg-[#f0f7ff] border-8 border-[#4a9fff] flex items-center justify-center mb-4"
              data-testid="meeting-timer-display"
            >
              <div className="text-4xl font-bold text-[#1a2a42]">
                {formatTime(currentTime)}
              </div>
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={toggleTimer}
                className="p-3 bg-[#4a9fff] text-white rounded-full hover:bg-[#3a8fee] focus:outline-none"
                data-testid="meeting-timer-toggle-button"
              >
                {isRunning ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>
              <button
                onClick={skipToNext}
                className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none"
                data-testid="meeting-timer-skip-button"
              >
                <SkipForwardIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div 
            className="bg-[#f0f7ff] rounded-lg p-4 mb-6"
            data-testid="meeting-current-speaker-section"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#4a9fff] flex items-center justify-center text-white mr-3">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-medium text-[#1a2a42]">
                    Current Speaker
                  </div>
                  <div className="text-lg font-bold text-[#1a2a42]">
                    {currentSpeaker}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <MicIcon className="h-5 w-5 text-[#4a9fff] mr-2" />
                <span className="text-[#4a9fff] font-medium">Speaking</span>
              </div>
            </div>
          </div>
          <div 
            className="bg-gray-50 rounded-lg p-4"
            data-testid="meeting-next-speaker-section"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-medium text-gray-500">Next Speaker</div>
                  <div className="text-lg font-medium text-gray-700">
                    {nextSpeaker}
                  </div>
                </div>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-[#1a2a42] mb-4">
            Meeting Notes
          </h3>
          <textarea
            placeholder="Add meeting notes here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a9fff] focus:border-transparent"
            data-testid="meeting-notes-textarea"
          ></textarea>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-[#1a2a42] mb-4">
            Participants
          </h3>
          <div 
            className="space-y-3"
            data-testid="meeting-participants-list"
          >
            {['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'].map(
              (name, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border-b border-gray-100"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[#e6f0ff] flex items-center justify-center text-[#4a9fff] mr-3">
                      {name.charAt(0)}
                    </div>
                    <span className="text-gray-700">{name}</span>
                  </div>
                  <div
                    className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`}
                  ></div>
                </div>
              ),
            )}
          </div>
        </div>
        <div 
          className="bg-white rounded-lg shadow-md p-6"
          data-testid="meeting-stats-section"
        >
          <h3 className="text-xl font-bold text-[#1a2a42] mb-4">
            Meeting Stats
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Meeting Progress</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#4a9fff] h-2 rounded-full"
                  style={{
                    width: '40%',
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Time Efficiency</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: '85%',
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Participation Rate</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: '75%',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingScreen

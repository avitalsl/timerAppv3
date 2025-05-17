import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock1Icon,
  UsersIcon,
  PlusIcon,
  CheckIcon,
} from 'lucide-react'

const SetupScreen = () => {
  const navigate = useNavigate()
  const [meetingName, setMeetingName] = useState('Daily Standup')
  const [duration, setDuration] = useState(15)
  const [timePerPerson, setTimePerPerson] = useState(2)

  const handleStartMeeting = () => {
    navigate('/meeting')
  }

  return (
    <div className="max-w-4xl mx-auto" data-testid="screen-setup">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-[#1a2a42] mb-6">
          Meeting Setup
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Name
            </label>
            <input
              type="text"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a9fff] focus:border-transparent"
              data-testid="setup-meeting-name-input"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Duration (minutes)
              </label>
              <div className="flex items-center">
                <Clock1Icon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a9fff] focus:border-transparent"
                  data-testid="setup-duration-input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Per Person (minutes)
              </label>
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="number"
                  value={timePerPerson}
                  onChange={(e) => setTimePerPerson(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a9fff] focus:border-transparent"
                  data-testid="setup-time-per-person-input"
                />
              </div>
            </div>
          </div>
          <div data-testid="setup-components-section">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Meeting Components
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className="h-5 w-5 rounded-full bg-[#4a9fff] flex items-center justify-center">
                  <CheckIcon className="h-3 w-3 text-white" />
                </div>
                <span className="ml-3 text-gray-700">Progress Updates</span>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className="h-5 w-5 rounded-full bg-[#4a9fff] flex items-center justify-center">
                  <CheckIcon className="h-3 w-3 text-white" />
                </div>
                <span className="ml-3 text-gray-700">Blockers Discussion</span>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className="h-5 w-5 rounded-full border border-gray-300"></div>
                <span className="ml-3 text-gray-700">Action Items Review</span>
              </div>
              <div className="flex items-center p-3 border border-dashed border-gray-300 rounded-md">
                <PlusIcon className="h-5 w-5 text-gray-400" />
                <span className="ml-3 text-gray-500">Add Custom Component</span>
              </div>
            </div>
          </div>
          <div data-testid="setup-participants-section">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Participants
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'].map(
                (name, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-[#e6f0ff] text-[#1a2a42] px-3 py-1 rounded-full"
                  >
                    <span>{name}</span>
                  </div>
                ),
              )}
              <div className="flex items-center bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                <PlusIcon className="h-4 w-4 mr-1" />
                <span>Add</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleStartMeeting}
            className="px-6 py-2 bg-[#4a9fff] text-white rounded-md hover:bg-[#3a8fee] focus:outline-none focus:ring-2 focus:ring-[#4a9fff] focus:ring-opacity-50"
            data-testid="setup-start-meeting-button"
          >
            Start Meeting
          </button>
        </div>
      </div>
    </div>
  )
}

export default SetupScreen

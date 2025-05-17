import { useState, useEffect } from 'react'
import {
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
} from 'lucide-react'

// Import layout configuration and widget components
import { useLayoutStorage } from '../hooks/useLayoutStorage'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// Import widget components
import ParticipantListWidget from '../components/widgets/ParticipantListWidget'
import LinksListWidget from '../components/widgets/LinksListWidget'
import NotesWidget from '../components/widgets/NotesWidget'
import AgendaWidget from '../components/widgets/AgendaWidget'
import SprintGoalsWidget from '../components/widgets/SprintGoalsWidget'
import ChecklistWidget from '../components/widgets/ChecklistWidget'

const ResponsiveGridLayout = WidthProvider(Responsive)

const MeetingScreen = () => {
  const [isRunning, setIsRunning] = useState(true)
  const [currentTime, setCurrentTime] = useState(120) // 2 minutes in seconds
  // We keep the nextSpeaker state but comment out currentSpeaker as it's not used in the current UI
  // const [currentSpeaker, setCurrentSpeaker] = useState('John Doe')
  const [nextSpeaker, setNextSpeaker] = useState('Jane Smith')
  
  // Load layout configuration from storage
  const { layoutConfig, isLoaded } = useLayoutStorage()

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
    // Update the next speaker directly since we're not using currentSpeaker in the UI
    setNextSpeaker('Mike Johnson')
    setIsRunning(true)
  }

  // Component mapping function for the meeting layout
  const renderComponentWidget = (componentType: string) => {
    switch (componentType) {
      case 'timer':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1a2a42]">Daily Standup</h2>
              <div className="text-sm text-gray-500">Total: 15:00 min</div>
            </div>
            <div className="flex flex-col items-center mb-4">
              <div 
                className="w-32 h-32 rounded-full bg-[#f0f7ff] border-8 border-[#4a9fff] flex items-center justify-center mb-4"
                data-testid="meeting-timer-display"
              >
                <div className="text-3xl font-bold text-[#1a2a42]">
                  {formatTime(currentTime)}
                </div>
              </div>
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={toggleTimer}
                  className="p-2 bg-[#4a9fff] text-white rounded-full hover:bg-[#3a8fee] focus:outline-none"
                  data-testid="meeting-timer-toggle-button"
                >
                  {isRunning ? (
                    <PauseIcon className="h-5 w-5" />
                  ) : (
                    <PlayIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={skipToNext}
                  className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none"
                  data-testid="meeting-timer-skip-button"
                >
                  <SkipForwardIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Next: {nextSpeaker}
              </div>
            </div>
          </div>
        );
      case 'participants':
        return <ParticipantListWidget />;
      case 'links':
        return <LinksListWidget />;
      case 'notes':
        return <NotesWidget />;
      case 'agenda':
        return <AgendaWidget />;
      case 'sprintGoals':
        return <SprintGoalsWidget />;
      case 'checklist':
        return <ChecklistWidget />;
      default:
        return (
          <div className="bg-gray-50 rounded p-4 h-full flex items-center justify-center">
            <p className="text-gray-400">Unknown component type</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full" data-testid="screen-meeting">
          {!isLoaded && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-gray-500">Loading layout configuration...</div>
            </div>
          )}
          {isLoaded && (
            <div className="mt-6">
              {/* Display the customized layout based on user configuration */}
              <ResponsiveGridLayout
                className="layout"
                layouts={layoutConfig.layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={80}
                isDraggable={false}
                isResizable={false}
                compactType="vertical"
              >
                {Object.entries(layoutConfig.components)
                  .filter(([_, component]) => component.visible)
                  .map(([id, component]) => (
                    <div 
                      key={id} 
                      className="border rounded-md bg-white shadow-sm overflow-hidden flex flex-col"
                      data-testid={`meeting-layout-item-${id}`}
                    >
                      <div className="p-2 flex-grow overflow-auto">
                        {renderComponentWidget(component.type)}
                      </div>
                    </div>
                  ))}
              </ResponsiveGridLayout>
            </div>
          )}
    </div>
  )
}

export default MeetingScreen

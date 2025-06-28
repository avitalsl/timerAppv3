import React, { useRef } from 'react';
import TimerWidget from './widgets/TimerWidget';
import type { TimerWidgetRef } from './widgets/TimerWidget';
import { useMeeting } from '../contexts/MeetingContext';
import { ComponentType, COMPONENT_DEFINITIONS } from '../types/layoutTypes';
import ParticipantListWidget from './widgets/ParticipantListWidget';
import MeetingOverScreen from './MeetingOverScreen'; // Import MeetingOverScreen
// Placeholder Widgets - these should be actual component imports
const PlaceholderWidget: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ padding: '1rem', border: '1px solid #ddd', backgroundColor: '#f9f9f9', height: '100%' }}>
    {name} Widget Placeholder
  </div>
);


const LinksWidget = () => <PlaceholderWidget name="Links" />;
const NotesWidget = () => <PlaceholderWidget name="Notes" />;
const AgendaWidget = () => <PlaceholderWidget name="Agenda" />;
const SprintGoalsWidget = () => <PlaceholderWidget name="Sprint Goals" />;
const ChecklistWidget = () => <PlaceholderWidget name="Checklist" />;

// Component Registry
const componentRegistry: Record<string, React.FC<any>> = {
  participants: ParticipantListWidget,
  links: LinksWidget,
  notes: NotesWidget,
  agenda: AgendaWidget,
  sprintGoals: SprintGoalsWidget,
  checklist: ChecklistWidget,
  // Timer is handled separately in the sidebar
};

// Create a context to share the timer ref across components
const TimerAnimationContext = React.createContext<{ triggerDonationAnimation: () => void } | null>(null);

// Hook to use the timer animation context
export const useTimerAnimation = () => {
  const context = React.useContext(TimerAnimationContext);
  if (!context) {
    throw new Error('useTimerAnimation must be used within a TimerAnimationProvider');
  }
  return context;
};

const MeetingScreen: React.FC = () => {
  const { state } = useMeeting();
  const { selectedGridComponentIds, timerStatus } = state;
  
  // Create a ref for the TimerWidget
  const timerWidgetRef = useRef<TimerWidgetRef>(null);

  // Check if the meeting is over
  const isMeetingOver = timerStatus === 'finished';

  // If the meeting is over, render the MeetingOverScreen
  if (isMeetingOver) {
    return <MeetingOverScreen />;
  }

  // Filter out 'timer', ensure component exists in registry, get definition, and sort by renderPriority
  const componentsToRender = selectedGridComponentIds
    .map(id => {
      const definition = COMPONENT_DEFINITIONS.find(def => def.id === id);
      return {
        id,
        Component: componentRegistry[id],
        renderPriority: definition?.renderPriority ?? 100, // Default to a low priority if no definition
      };
    })
    .filter(compInfo => compInfo.id !== 'timer' && compInfo.Component) // Ensure component exists and is not timer
    .sort((a, b) => a.renderPriority - b.renderPriority); // Sort by renderPriority

  return (
    <TimerAnimationContext.Provider value={{ 
      triggerDonationAnimation: () => timerWidgetRef.current?.triggerDonationAnimation() 
    }}>
      <div 
        style={{
          display: 'flex', 
          height: '100%',   
          width: '100%',
          overflow: 'hidden', 
        }}
        data-testid="meeting-screen-container"
      >
        {/* Timer Sidebar */}
        <div
          style={{
            width: '300px',    
            flexShrink: 0,      
            // backgroundColor: '#f0f0f0',
            padding: '1rem',
            height: '100%',     
            overflowY: 'hidden',  
            borderRight: '1px solid #ddd',
          }}
          data-testid="timer-sidebar"
        >
          <TimerWidget ref={timerWidgetRef} />
        </div>

        {/* Content Grid Area */}
        <div
          style={{
            flexGrow: 1,        
            padding: '1rem',
            height: '100%',     
            overflowY: 'auto',  
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(max(300px, calc((100% - 2 * 1rem) / 3)), 1fr))', // Updated for max 3 columns
            gap: '1rem',
            alignContent: 'start', 
          }}
          data-testid="meeting-content-grid"
        >
          {
            componentsToRender.length > 0 ? (
              componentsToRender.map(compInfo => (
                <div key={compInfo.id} data-testid={`grid-item-${compInfo.id}`}>
                  <compInfo.Component />
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#777', gridColumn: '1 / -1', alignSelf: 'center', fontStyle: 'italic' }} data-testid="empty-grid-message">
                No additional components selected for the meeting.
              </div>
            )
          }
        </div>
      </div>
    </TimerAnimationContext.Provider>
  );
};

export default MeetingScreen;

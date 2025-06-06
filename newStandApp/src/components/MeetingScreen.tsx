import React from 'react';
import TimerWidget from './widgets/TimerWidget';
import { useMeeting } from '../contexts/MeetingContext';
import { ComponentType, COMPONENT_DEFINITIONS } from '../types/layoutTypes';
import ParticipantListWidget from './widgets/ParticipantListWidget';
import StoryWidget from './widgets/StoryWidget'; // Import StoryWidget
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
  [ComponentType.STORY]: StoryWidget, // Added StoryWidget to the registry
  // Timer is handled separately in the sidebar
};



const MeetingScreen: React.FC = () => {
  const { state } = useMeeting();
  const { selectedGridComponentIds } = state;

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
        <TimerWidget />
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
  );
};

export default MeetingScreen;

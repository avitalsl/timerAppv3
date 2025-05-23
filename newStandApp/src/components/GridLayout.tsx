import React, { useRef, useEffect, useState, type CSSProperties } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { LayoutItem } from '../types/layoutTypes';
import { ComponentType } from '../types/layoutTypes';

// Import widget components
import TimerWidget from './widgets/TimerWidget';
import ParticipantListWidget from './widgets/ParticipantListWidget';
import LinksListWidget from './widgets/LinksListWidget';
import NotesWidget from './widgets/NotesWidget';
import AgendaWidget from './widgets/AgendaWidget';
import SprintGoalsWidget from './widgets/SprintGoalsWidget';
import ChecklistWidget from './widgets/ChecklistWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Component mapping function
const renderComponentWidget = (componentType: ComponentType) => {
  switch (componentType) {
    case ComponentType.TIMER:
      return <TimerWidget />;
    case ComponentType.PARTICIPANTS:
      return <ParticipantListWidget />;
    case ComponentType.LINKS:
      return <LinksListWidget />;
    case ComponentType.NOTES:
      return <NotesWidget />;
    case ComponentType.AGENDA:
      return <AgendaWidget />;
    case ComponentType.SPRINT_GOALS:
      return <SprintGoalsWidget />;
    case ComponentType.CHECKLIST:
      return <ChecklistWidget />;
    default:
      return <div>Unknown component type</div>;
  }
};

interface GridLayoutProps {
  layouts: { [key: string]: LayoutItem[] };
  components: {
    [id: string]: {
      type: ComponentType;
      visible: boolean;
      config?: any;
    }
  };
  onLayoutChange: (layout: LayoutItem[], layouts: { [key: string]: LayoutItem[] }) => void;
  disableLayoutControls?: boolean; // Optional prop to hide controls in overlay mode
  inMeetingOverlay?: boolean; // Flag to indicate if component is rendered in meeting overlay
}

const GridLayout: React.FC<GridLayoutProps> = ({
  layouts,
  components,
  onLayoutChange,
  disableLayoutControls = false,
  inMeetingOverlay = false
}) => {
  // Ref for the grid container
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  // Update container width and height on resize
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setContainerHeight(containerRef.current.offsetHeight);
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Filter to only visible components
  const visibleItems = Object.entries(components)
    .filter(([_, component]) => component.visible)
    .map(([id, _]) => id);

  // Filter layouts to only include visible components
  const filteredLayouts = Object.entries(layouts).reduce(
    (acc, [breakpoint, layout]) => {
      acc[breakpoint] = layout.filter(item => visibleItems.includes(item.i));
      return acc;
    },
    {} as { [key: string]: LayoutItem[] }
  );

  console.log('[GridLayout] Rendering with filtered layouts:', filteredLayouts);
  console.log('[GridLayout] Visible components:', visibleItems);

  // Calculate minWidth/minHeight for grid items
  let gridItemStyle: CSSProperties = {};
  const GAP = 10; // px, must match the margin prop in ResponsiveGridLayout
  if (visibleItems.length === 3 && containerWidth > 0) {
    // There are two gaps between three items
    const minWidth = (containerWidth - 2 * GAP) / 3;
    gridItemStyle.minWidth = `${minWidth}px`;
  }
  if (visibleItems.length === 4 && containerHeight > 0) {
    // There are three gaps between four items
    const minHeight = (containerHeight - 3 * GAP) / 4;
    gridItemStyle.minHeight = `${minHeight}px`;
  }

  return (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm"
      data-testid="grid-layout"
    >
      {!disableLayoutControls && (
        <h3 className="text-lg font-medium text-gray-700 mb-3">
          Layout Preview
        </h3>
      )}
      <div 
        className={`border border-gray-200 bg-gray-50 rounded-md min-h-[400px] ${inMeetingOverlay ? 'h-[600px] w-full' : 'max-h-[2400px]'} overflow-auto`}
        data-testid="grid-layout-container"
        style={inMeetingOverlay ? { overflowY: 'auto', overflowX: 'auto' } : {}}
        ref={containerRef}
      >
        <ResponsiveGridLayout
          className="layout"
          layouts={filteredLayouts}
          breakpoints={{ lg: 0 }}
          cols={{ lg: 12 }}
          rowHeight={60}
          compactType="vertical" // Use vertical compaction to fix height issues
          preventCollision={false} // Allow components to flow naturally
          margin={[10, 10]} // Add some margin between items
          containerPadding={[10, 10]} // Add padding inside the container
          useCSSTransforms={true} // Improve performance
          autoSize={!inMeetingOverlay} // Only auto-size when not in meeting overlay
          maxRows={25} // Limit maximum number of rows to prevent excessive height
          isDraggable={!inMeetingOverlay} // Disable dragging in meeting overlay
          isResizable={!inMeetingOverlay} // Disable resizing in meeting overlay
          onLayoutChange={(currentLayout, allLayouts) => {
            console.log('[GridLayout] Layout changed:', { 
              currentLayout, 
              allLayouts,
              time: new Date().toISOString()
            });
            onLayoutChange(currentLayout, allLayouts);
          }}
          style={inMeetingOverlay ? { position: 'relative', width: '100%' } : {}}
        >
          {Object.entries(components)
            .filter(([_, component]) => component.visible)
            .map(([id, component]) => (
              <div 
                key={id} 
                className="border border-gray-300 rounded-md bg-white shadow-sm overflow-hidden flex flex-col"
                data-testid={`grid-layout-item-${id}`}
                style={gridItemStyle}
              >
                {!inMeetingOverlay && (
                  <div className="bg-gray-100 p-2 border-b border-gray-300 flex justify-between items-center">
                    <span className="font-medium text-sm">{id}</span>
                  </div>
                )}
                <div className="p-2 flex-grow overflow-auto">
                  {renderComponentWidget(component.type)}
                </div>
              </div>
            ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default GridLayout;

# Configurable Meeting Layout Setup Page - Implementation Guide

## Overview
This document provides implementation details for the Configurable Meeting Layout Setup Page feature, which allows users to select and arrange UI components in a grid layout for their meeting screen.

## Architecture

### Key Components

1. **Types and Interfaces** (`components/meetingLayout/types.ts`)
   - Define component types, layout configuration interfaces, and default settings

2. **Component Picker** (`components/meetingLayout/ComponentPicker.tsx`)
   - Toggleable list of available components
   - Drives visibility of components in the grid

3. **Grid Layout** (`components/meetingLayout/GridLayout.tsx`)
   - Drag and drop grid layout using react-grid-layout
   - Manages component positioning and sizing

4. **Layout Components** (`components/meetingLayout/layoutComponents/`)
   - Individual UI widgets that can be added to the layout
   - Each with defined min/max sizes and default configurations

5. **Layout Storage Hook** (`hooks/useLayoutStorage.ts`)
   - Manages saving and loading layout configurations to localStorage
   - Optional Firebase integration for cross-device persistence

## Implementation Steps

### 1. Install Dependencies

```bash
npm install react-grid-layout
npm install --save-dev @types/react-grid-layout
```

### 2. Create Types and Interfaces

Create `/components/meetingLayout/types.ts`:

```typescript
export enum ComponentType {
  TIMER = 'timer',
  PARTICIPANTS = 'participants',
  LINKS = 'links',
  NOTES = 'notes',
  AGENDA = 'agenda',
  SPRINT_GOALS = 'sprintGoals',
  CHECKLIST = 'checklist'
}

export interface ComponentDefinition {
  id: string;
  type: ComponentType;
  label: string;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  maxSize?: { w: number; h: number };
  isRequired?: boolean; // Timer will be true
}

export interface LayoutItem {
  i: string;        // Component ID
  x: number;        // Grid position X
  y: number;        // Grid position Y
  w: number;        // Width in grid units
  h: number;        // Height in grid units
  minW?: number;    // Min width
  minH?: number;    // Min height
  maxW?: number;    // Max width
  maxH?: number;    // Max height
  static?: boolean; // If true, not draggable or resizable
}

export interface LayoutConfiguration {
  layouts: {
    [key: string]: LayoutItem[]  // Different breakpoints (xs, sm, md, lg)
  };
  components: {
    [id: string]: {
      type: ComponentType;
      visible: boolean;
      config?: any;  // Component-specific configuration
    }
  };
}

// Default component definitions with preset sizes and constraints
export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    id: 'timer',
    type: ComponentType.TIMER,
    label: 'Timer',
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 2, h: 2 },
    isRequired: true
  },
  {
    id: 'participants',
    type: ComponentType.PARTICIPANTS,
    label: 'Meeting participant list',
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 2 }
  },
  {
    id: 'links',
    type: ComponentType.LINKS,
    label: 'List of links',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 }
  },
  {
    id: 'notes',
    type: ComponentType.NOTES,
    label: 'Area for notes',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 2, h: 2 }
  },
  {
    id: 'agenda',
    type: ComponentType.AGENDA,
    label: 'Meeting agenda',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 }
  },
  {
    id: 'sprintGoals',
    type: ComponentType.SPRINT_GOALS,
    label: 'Sprint goals',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 }
  },
  {
    id: 'checklist',
    type: ComponentType.CHECKLIST,
    label: 'Checklist time',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 }
  }
];

// Default empty layout with just timer
export const DEFAULT_LAYOUT_CONFIG: LayoutConfiguration = {
  layouts: {
    lg: [
      { i: 'timer', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2, static: false }
    ]
  },
  components: {
    timer: { type: ComponentType.TIMER, visible: true }
  }
};
```

### 3. Create Component Picker

Create `/components/meetingLayout/ComponentPicker.tsx`:

```typescript
import React from 'react';
import { ComponentDefinition, ComponentType } from './types';

interface ComponentPickerProps {
  components: ComponentDefinition[];
  selectedComponents: string[];
  onToggleComponent: (componentId: string, selected: boolean) => void;
}

const ComponentPicker: React.FC<ComponentPickerProps> = ({
  components,
  selectedComponents,
  onToggleComponent
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm" data-testid="component-picker">
      <h3 className="text-lg font-medium text-gray-700 mb-3">
        Layout Components
      </h3>
      <div className="space-y-2">
        {components.map((component) => (
          <div 
            key={component.id}
            className="flex items-center p-2.5 border border-gray-200 rounded-md"
            data-testid={`component-picker-item-${component.id}`}
          >
            <input
              type="checkbox"
              id={`component-${component.id}`}
              checked={selectedComponents.includes(component.id)}
              onChange={(e) => onToggleComponent(component.id, e.target.checked)}
              disabled={component.isRequired}
              className="h-4 w-4 text-[#4a9fff] focus:ring-[#4a9fff] border-gray-300 rounded"
              data-testid={`component-picker-checkbox-${component.id}`}
            />
            <label
              htmlFor={`component-${component.id}`}
              className="ml-3 block text-sm font-medium text-gray-700"
              data-testid={`component-picker-label-${component.id}`}
            >
              {component.label}
              {component.isRequired && (
                <span className="ml-2 text-xs text-gray-500">(Required)</span>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentPicker;
```

### 4. Create the Layout Storage Hook

Create `/hooks/useLayoutStorage.ts`:

```typescript
import { useState, useEffect } from 'react';
import { LayoutConfiguration, DEFAULT_LAYOUT_CONFIG } from '../components/meetingLayout/types';

export function useLayoutStorage(key: string = 'meetingLayoutConfig') {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfiguration>(DEFAULT_LAYOUT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load layout from localStorage on component mount
  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem(key);
      if (storedConfig) {
        setLayoutConfig(JSON.parse(storedConfig));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading layout configuration:', error);
      setIsLoaded(true);
    }
  }, [key]);

  // Save layout to localStorage whenever it changes
  const saveLayout = (newConfig: LayoutConfiguration) => {
    try {
      localStorage.setItem(key, JSON.stringify(newConfig));
      setLayoutConfig(newConfig);
    } catch (error) {
      console.error('Error saving layout configuration:', error);
    }
  };

  return { layoutConfig, saveLayout, isLoaded };
}
```

### 5. Create Grid Layout Component

Create `/components/meetingLayout/GridLayout.tsx`:

```typescript
import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { LayoutItem, ComponentType } from './types';

// Import individual layout components
import Timer from './layoutComponents/Timer';
import ParticipantList from './layoutComponents/ParticipantList';
import LinksList from './layoutComponents/LinksList';
import Notes from './layoutComponents/Notes';
import Agenda from './layoutComponents/Agenda';
import SprintGoals from './layoutComponents/SprintGoals';
import ChecklistTime from './layoutComponents/ChecklistTime';

const ResponsiveGridLayout = WidthProvider(Responsive);

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
}

// Component mapping function
const renderComponent = (id: string, componentType: ComponentType) => {
  switch (componentType) {
    case ComponentType.TIMER:
      return <Timer />;
    case ComponentType.PARTICIPANTS:
      return <ParticipantList />;
    case ComponentType.LINKS:
      return <LinksList />;
    case ComponentType.NOTES:
      return <Notes />;
    case ComponentType.AGENDA:
      return <Agenda />;
    case ComponentType.SPRINT_GOALS:
      return <SprintGoals />;
    case ComponentType.CHECKLIST:
      return <ChecklistTime />;
    default:
      return <div>Unknown component</div>;
  }
};

const GridLayout: React.FC<GridLayoutProps> = ({
  layouts,
  components,
  onLayoutChange
}) => {
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

  return (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm"
      data-testid="grid-layout"
    >
      <h3 className="text-lg font-medium text-gray-700 mb-3">
        Layout Preview
      </h3>
      <div 
        className="border border-gray-200 bg-gray-50 rounded-md min-h-[400px]"
        data-testid="grid-layout-container"
      >
        <ResponsiveGridLayout
          className="layout"
          layouts={filteredLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          compactType="vertical"
          onLayoutChange={(currentLayout, allLayouts) => onLayoutChange(currentLayout, allLayouts)}
        >
          {Object.entries(components)
            .filter(([_, component]) => component.visible)
            .map(([id, component]) => (
              <div 
                key={id} 
                className="border border-gray-300 rounded-md bg-white shadow-sm overflow-hidden flex flex-col"
                data-testid={`grid-layout-item-${id}`}
              >
                <div className="bg-gray-100 p-2 border-b border-gray-300 flex justify-between items-center">
                  <span className="font-medium text-sm">{id}</span>
                </div>
                <div className="p-2 flex-grow overflow-auto">
                  {renderComponent(id, component.type)}
                </div>
              </div>
            ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default GridLayout;
```

### 6. Create Layout Components

Create skeleton implementations for each layout component. Here's an example for the Timer component:

Create `/components/meetingLayout/layoutComponents/Timer.tsx`:

```typescript
import React, { useState } from 'react';
import { Clock1Icon, PlayIcon, PauseIcon, RefreshIcon } from 'lucide-react';

const Timer: React.FC = () => {
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
          <RefreshIcon className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default Timer;
```

Create similar skeleton components for each of the other layout components.

### 7. Update the SetupScreen Component

Update `/pages/SetupScreen.tsx` to include the new layout configuration feature:

```typescript
// Import new components and hooks
import ComponentPicker from '../components/meetingLayout/ComponentPicker';
import GridLayout from '../components/meetingLayout/GridLayout';
import { useLayoutStorage } from '../hooks/useLayoutStorage';
import { COMPONENT_DEFINITIONS, ComponentType } from '../components/meetingLayout/types';
```

Then add the new layout configuration section to the SetupScreen component.

## Testing Guidelines

### Unit Tests

Create tests for each component:

1. **ComponentPicker Tests**
   - Test component render with default props
   - Test checkbox interaction and callback firing
   - Test disabled state for required components

2. **GridLayout Tests**
   - Test rendering with various layout configurations
   - Test layout change callbacks

3. **useLayoutStorage Hook Tests**
   - Test loading from localStorage
   - Test saving to localStorage
   - Test default fallback behavior

### End-to-End Testing

Use Playwright to test the entire layout configuration flow:

1. Select and deselect components
2. Verify grid updates with selected components
3. Drag and resize components
4. Save configuration and reload to verify persistence

## Implementation Timeline

1. **Day 1**: Setup types, interfaces, and dependencies
2. **Day 2**: Implement ComponentPicker and basic Grid Layout
3. **Day 3**: Implement individual layout components  
4. **Day 4**: Integrate with SetupScreen and add storage
5. **Day 5**: Testing and refinement

## Accessibility Considerations

- Ensure all components have proper ARIA attributes
- Verify keyboard navigation for component selection
- Test all interactions with screen readers

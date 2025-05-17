# Meeting Timer Application Implementation Plan

## Project Overview
Implementation of a meeting timer application with the following features:
- Meeting setup and configuration
- Active meeting management with timers
- Speaker tracking
- Meeting statistics
- Participant management
- Configurable meeting layout

## Technical Stack
- React with TypeScript
- React Router for navigation
- TailwindCSS for styling
- Lucide for icons
- Vite as the build tool

## Implementation Plan

### 1. Directory Structure Setup
```
src/
├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── meetingLayout/
│   │   ├── GridLayout.tsx
│   │   ├── ComponentPicker.tsx
│   │   ├── layoutComponents/
│   │   │   ├── Timer.tsx
│   │   │   ├── ParticipantList.tsx
│   │   │   ├── LinksList.tsx
│   │   │   ├── Notes.tsx
│   │   │   ├── Agenda.tsx
│   │   │   ├── SprintGoals.tsx
│   │   │   └── ChecklistTime.tsx
│   │   └── types.ts
├── layouts/
│   └── MainLayout.tsx
├── hooks/
│   └── useLayoutStorage.ts
├── pages/
│   ├── SetupScreen.tsx
│   └── MeetingScreen.tsx
├── utils/
│   └── layoutUtils.ts
├── App.tsx
├── index.css
├── index.tsx (renamed from main.tsx)
```

### 2. Configuration Files
- Update tailwind.config.js
- Update index.css for Tailwind imports
- Add react-grid-layout package

### 3. Implementation Tasks
1. **Create Layout Components**
   - Implement MainLayout.tsx with Sidebar and Header
   
2. **Create UI Components**
   - Implement Sidebar.tsx with navigation
   - Implement Header.tsx with app header
   
3. **Create Pages**
   - Implement SetupScreen.tsx for meeting configuration
   - Implement MeetingScreen.tsx for active meeting management
   
4. **Update Core Files**
   - Update App.tsx with routing
   - Update index.css with Tailwind imports
   - Create or update tailwind.config.js

5. **Implement Configurable Meeting Layout Feature**
   - Create component layout types and interfaces (types.ts)
   - Implement reusable layout components (Timer, ParticipantList, etc.)
   - Create the ComponentPicker component for selecting available widgets
   - Implement the GridLayout component for drag-and-drop grid arrangement
   - Update SetupScreen.tsx to include the component picker and grid layout
   - Create useLayoutStorage hook for persisting layout configuration
   - Implement layout utility functions for grid operations

### 4. Data Structure
- Meeting configuration (name, duration, time per person)
- Participants list
- Meeting components/agenda
- Timer state management
- Layout configuration:
  ```typescript
  interface LayoutConfiguration {
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

  interface LayoutItem {
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

  enum ComponentType {
    TIMER = 'timer',
    PARTICIPANTS = 'participants',
    LINKS = 'links',
    NOTES = 'notes',
    AGENDA = 'agenda',
    SPRINT_GOALS = 'sprintGoals',
    CHECKLIST = 'checklist'
  }
  ```

### 5. Testing Strategy
- Test all components using the data-testid attributes
- Document all component test IDs in screens.md
- Add specific tests for grid layout functionality:
  - Component selection/deselection
  - Grid layout persistence
  - Component drag and resize operations

## Implementation Notes
- The application follows a responsive design approach with mobile-first considerations
- Color scheme uses blue tones (#1a2a42, #4a9fff) for primary elements
- Navigation uses React Router with proper routing
- The Grid Layout will be implemented using `react-grid-layout`
- Layout configuration will be stored in localStorage by default, with optional Firebase storage

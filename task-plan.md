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

# Active Meeting Overlay Component Implementation Plan

## 1. Component Architecture

### New Components
- **MeetingOverlay**: Main overlay component that renders on top of MainLayout
- **TopBarMeetingButton**: Persistent button in the application's top bar
- **OverlayProvider**: Context provider to manage overlay visibility state globally

### Modified Components
- **Header**: Will need to integrate the TopBarMeetingButton
- **MainLayout**: Will need to include the OverlayProvider and MeetingOverlay

## 2. Implementation Steps

### Step 1: Set Up Global State Management
1. Create `src/contexts/OverlayContext.tsx`
   - Implement context with state for overlay visibility
   - Provide methods to open and close the overlay
   - Export useOverlay hook for components to access context

### Step 2: Create TopBarMeetingButton Component
1. Create `src/components/TopBarMeetingButton.tsx`
   - Implement UI for the start meeting button
   - Use useOverlay hook to control overlay visibility
   - Style button according to application's design system

### Step 3: Integrate Button in Header
1. Modify `src/components/Header.tsx`
   - Import and add TopBarMeetingButton
   - Position appropriately in the header

### Step 4: Create MeetingOverlay Component
1. Create `src/components/MeetingOverlay.tsx`
   - Implement ReactDOM.createPortal for overlay rendering
   - Use useLayoutStorage hook to access saved layout configuration
   - Include close button with position fixed in top corner
   - Implement transition/animation effects
   - Style overlay container with proper dimensions and background

### Step 5: Update MainLayout
1. Modify `src/layouts/MainLayout.tsx`
   - Wrap with OverlayProvider
   - Add MeetingOverlay component

### Step 6: Reuse Grid Layout Components
1. Create utilities to ensure GridLayout components can be reused in overlay
   - Ensure the same layout configuration is loaded
   - Modify any necessary props to adapt to overlay context

## 3. Technical Considerations

### State Management
- Use React Context API for global state management
- Store overlay visibility state (boolean)
- Consider persisting meeting state if user navigates while overlay is open

### Portal Implementation
```tsx
// Example of Portal implementation
import ReactDOM from 'react-dom';

const MeetingOverlay = () => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-gray-100">
      {/* Overlay content */}
    </div>,
    document.body
  );
};
```

### Layout Data Sharing
- Ensure useLayoutStorage hook is accessible to both Setup screen and Overlay
- Handle cases where layout configuration might not be available

### Animation
- Implement smooth transition effects using Tailwind classes
- Consider opacity and transform transitions for natural feel

## 4. Testing Plan

### Unit Tests
- Test overlay context functionality (open/close methods)
- Test TopBarMeetingButton component rendering and click events
- Test MeetingOverlay component rendering

### Integration Tests
- Test that clicking button opens overlay
- Test that close button hides overlay
- Test that correct layout is displayed in overlay

### E2E Tests
- Test full workflow: configure layout → open overlay → interact with widgets → close

## 5. Timeline Estimate

| Task | Estimated Time |
|------|----------------|
| Set up global state management | 1 hour |
| Create TopBarMeetingButton | 1 hour |
| Integrate button in Header | 30 minutes |
| Create MeetingOverlay component | 3 hours |
| Update MainLayout | 30 minutes |
| Reuse Grid Layout Components | 1 hour |
| Testing | 2 hours |
| **Total** | **~9 hours** |

## 6. UI / Interaction Guidelines

* **Start Meeting Button**:
  * Location: Top bar (always visible)
  * Appearance: Primary-style button or icon-button with tooltip

* **Overlay**:
  * Full-width, full-height layer above `MainLayout` (`100vw` / `100vh`)
  * The **actual layout grid** should appear in a **centered container** (e.g., `max-w-7xl`, `mx-auto`) with padding
  * The area around the layout grid should use a **neutral gray background** (e.g., `bg-gray-100`) to frame and isolate the content
  * Creates a focused environment while still signaling it's an overlay
  * Includes a close button in a fixed top corner
  * Should appear with a smooth animation or transition

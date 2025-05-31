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

# Dynamic Sidebar Feature Control Implementation Plan

## Feature Overview
Transform the sidebar from displaying static links to all features into a dynamic component that only shows links to features that have been selected by the user in the Feature Selection Panel.

## Current Implementation Analysis

### State Management
- The application uses React Context (`MeetingContext`) for global state management
- Selected components are tracked in the `selectedGridComponentIds` state in `MeetingContext`
- The sidebar currently displays static links to all features regardless of selection status

### Component Structure
- `Sidebar.tsx`: Contains the sidebar navigation with static links
- `ComponentPicker.tsx`: Allows users to select which features to include
- `SetupScreen.tsx`: Manages the feature selection state
- `MeetingContext.tsx`: Stores selected grid component IDs in the global state

## Implementation Plan

### 1. Update Sidebar Component

#### Modify Sidebar.tsx to render links dynamically
```tsx
// Sidebar.tsx
import { useMeeting } from '../contexts/MeetingContext';

const Sidebar = () => {
  const { state } = useMeeting();
  const selectedFeatures = state.selectedGridComponentIds;
  
  // Rest of the component...
  
  return (
    <aside data-testid="component-sidebar">
      {/* Always show Feature Selection (Home) link */}
      <NavLink to="/" end data-testid="sidebar-nav-link-home">
        <SettingsIcon />
        <span>Customize Meeting</span>
      </NavLink>
      
      {/* Always show Timer Setup link */}
      <NavLink to="/meeting" data-testid="sidebar-nav-link-meeting">
        <LayoutDashboardIcon />
        <span>Timer Setup</span>
      </NavLink>
      
      {/* Conditionally render feature links based on selection */}
      {selectedFeatures.includes('participants') && (
        <NavLink to="/participants" data-testid="sidebar-nav-link-participants">
          <UsersIcon />
          <span>Participants</span>
        </NavLink>
      )}
      
      {selectedFeatures.includes('links') && (
        <NavLink to="/links" data-testid="sidebar-nav-link-links">
          <LinkIcon />
          <span>Set Links</span>
        </NavLink>
      )}
      
      {/* Kickoff is always visible */}
      <div data-testid="sidebar-kickoff" onClick={() => navigate('/kickoff')}>
        <CalendarIcon />
        <span>Kickoff</span>
      </div>
    </aside>
  );
};
```

### 2. Add Animation for Smooth Transitions

```css
/* Add to index.css or create a new sidebar.css */
.sidebar-link-enter {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.sidebar-link-enter-active {
  opacity: 1;
  max-height: 60px;
  transition: opacity 300ms, max-height 300ms;
}

.sidebar-link-exit {
  opacity: 1;
  max-height: 60px;
}

.sidebar-link-exit-active {
  opacity: 0;
  max-height: 0;
  transition: opacity 300ms, max-height 300ms;
  overflow: hidden;
}
```

### 3. Create a SidebarLink Component for Reusability

```tsx
// components/SidebarLink.tsx
import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';

interface SidebarLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
  testId: string;
  show: boolean;
}

const SidebarLink = ({ to, icon, label, testId, show }: SidebarLinkProps) => {
  return (
    <CSSTransition
      in={show}
      timeout={300}
      classNames="sidebar-link"
      unmountOnExit
    >
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center py-3 px-4 ${isActive ? 'bg-[#2c4066] border-l-4 border-[#4a9fff]' : ''}`
        }
        data-testid={testId}
      >
        {icon}
        <span className="ml-3 hidden tablet:block">{label}</span>
      </NavLink>
    </CSSTransition>
  );
};

export default SidebarLink;
```

### 4. Update Feature Selection to Update MeetingContext

Modify `SetupScreen.tsx` to update the MeetingContext when components are toggled:

```tsx
// In SetupScreen.tsx handleToggleComponent function
const { state, dispatch } = useMeeting();

const handleToggleComponent = (componentId: string, selected: boolean) => {
  // Update local state for UI rendering
  if (selected) {
    setSelectedComponents(prev => [...prev, componentId]);
  } else {
    setSelectedComponents(prev => prev.filter(id => id !== componentId));
  }
  
  // Update MeetingContext
  const updatedSelectedComponents = selected 
    ? [...state.selectedGridComponentIds, componentId]
    : state.selectedGridComponentIds.filter(id => id !== componentId);
    
  // Dispatch action to update MeetingContext
  dispatch({
    type: 'UPDATE_SELECTED_COMPONENTS',
    payload: updatedSelectedComponents
  });
};
```

### 5. Mapping Between Component IDs and Routes

Create a utility to map component IDs to their corresponding routes:

```typescript
// utils/routeMapping.ts
export const componentToRouteMap: Record<string, string> = {
  participants: '/participants',
  links: '/links',
  notes: '/notes',
  agenda: '/agenda',
  sprintGoals: '/sprint-goals',
  checklist: '/checklist'
};

export const getRouteForComponent = (componentId: string): string | null => {
  return componentToRouteMap[componentId] || null;
};
```

## Testing Strategy

Following the project's testing guidelines, we'll use Playwright for end-to-end testing. Tests will be located adjacent to the feature they're testing.

### Test Location
- Create `src/components/Sidebar.test.ts` for testing the dynamic sidebar functionality

### Test Cases

```typescript
// src/components/Sidebar.test.ts
import { test, expect } from '@playwright/test';

test.describe('Dynamic Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the setup screen
    await page.goto('/');
  });

  test('should only show default links initially', async ({ page }) => {
    // Check that default links are visible
    await expect(page.getByTestId('sidebar-nav-link-home')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-link-meeting')).toBeVisible();
    await expect(page.getByTestId('sidebar-kickoff')).toBeVisible();
    
    // Check that feature-specific links are not visible
    await expect(page.getByTestId('sidebar-nav-link-participants')).not.toBeVisible();
    await expect(page.getByTestId('sidebar-nav-link-links')).not.toBeVisible();
  });

  test('should show participants link when participants feature is selected', async ({ page }) => {
    // Select the participants component
    await page.getByTestId('component-picker-checkbox-participants').click();
    
    // Check that participants link appears in sidebar
    await expect(page.getByTestId('sidebar-nav-link-participants')).toBeVisible();
  });

  test('should remove links link when links feature is deselected', async ({ page }) => {
    // First select the links component
    await page.getByTestId('component-picker-checkbox-links').click();
    
    // Verify links link is visible
    await expect(page.getByTestId('sidebar-nav-link-links')).toBeVisible();
    
    // Deselect the links component
    await page.getByTestId('component-picker-checkbox-links').click();
    
    // Verify links link is no longer visible
    await expect(page.getByTestId('sidebar-nav-link-links')).not.toBeVisible();
  });

  test('should navigate to feature page when sidebar link is clicked', async ({ page }) => {
    // Select the participants component
    await page.getByTestId('component-picker-checkbox-participants').click();
    
    // Click on the participants link
    await page.getByTestId('sidebar-nav-link-participants').click();
    
    // Verify navigation to participants page
    await expect(page).toHaveURL(/.*\/participants/);
  });
});
```

### Test IDs
Update the data-testid attributes in the sidebar component:
```
- `sidebar-nav-link-{component.id}`: For each dynamic sidebar link (e.g., `sidebar-nav-link-participants`)
- `sidebar-link-container`: Container for all dynamic links
```

## Implementation Timeline

1. **Day 1**: Update Sidebar component to read from layout configuration
2. **Day 2**: Implement animations and SidebarLink component
3. **Day 3**: Testing and refinement

## Technical Considerations

- Performance: Avoid unnecessary re-renders by using React.memo or useMemo for the Sidebar component
- State Management: Add a new action type to MeetingContext for updating selected components
- Responsive Design: Maintain the existing responsive behavior for mobile/tablet/desktop views
- Backward Compatibility: Ensure existing routes and navigation still work correctly
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

# Grid Space Optimization Enhancement Plan


---

## TimerSetup Component – Initial Feature Set

### 1. Feature Overview
The TimerSetup component allows users to configure how the meeting timer will behave before a meeting starts. It provides a user-friendly UI for selecting timer modes and extension options.

### 2. UI/UX Requirements

#### Section 1: Timer Mode Selection
- **Purpose:** Let users choose how time is allocated in the meeting.
- **Options:**
  - **Option A:** Fixed meeting time (user enters total duration, e.g., 15 minutes)
  - **Option B:** Per participant (user enters time per speaker, e.g., 1 minute per participant)
- **UI Elements:**
  - Radio buttons or segmented control for mode selection
  - Number input (or dropdown) for:
    - Total meeting duration (if Option A)
    - Time per participant (if Option B)
  - Clear, descriptive labels for all controls

#### Section 2: Enable Time Extension
- **Purpose:** Let users decide if time can be added during the meeting.
- **Options:**
  - Checkbox/toggle: "Allow adding time during the meeting"
  - If enabled, show number input for extension amount:
    - For "Per participant" mode: applies to current speaker
    - For "Fixed meeting" mode: applies to total meeting timer
  - Clear, descriptive labels for all controls

### 3. State & Logic Requirements
- Store selected timer mode and associated value
- Store whether time extension is allowed and the extension amount
- When timer mode changes, reset or hide irrelevant inputs
- Validate inputs (e.g., positive numbers, required fields)
- Expose configuration state for use by the meeting logic

### 4. Data Structure Example
```typescript
interface TimerSetupConfig {
  mode: 'fixed' | 'per-participant';
  totalDurationMinutes?: number;      // for fixed mode
  perParticipantMinutes?: number;     // for per-participant mode
  allowExtension: boolean;
  extensionAmountMinutes?: number;
}
```

### 5. Testing
- Each UI control should have a unique data-testid
- Test user flows for both modes and extension option
- Test that state updates as expected when user interacts

### 6. Next Steps
- Implement TimerSetup.tsx UI and state logic
- Integrate with meeting start flow
- Document test IDs in screens.md


## Feature Overview
Enhance the Active Meeting Overlay to automatically optimize component placement by expanding existing components to fill empty grid spaces.

## 1. Component Architecture

### New Utility
- **layoutOptimizer**: A utility function that takes a layout configuration and optimizes it by expanding components to fill empty spaces

### Modified Components
- **MeetingOverlay**: Will need to apply the layout optimization when rendering the grid
- **GridLayout**: May need modifications to support the optimized layout mode

## 2. Implementation Steps

### Step 1: Create Layout Optimization Utility
1. Create `src/utils/layoutOptimizer.ts`
   - Implement algorithm to identify and fill empty spaces in the grid
   - Create different optimization strategies (e.g., prioritize horizontal expansion, vertical expansion, or balanced)
   - Handle edge cases like disconnected empty regions

### Step 2: Update MeetingOverlay Component
1. Modify `src/components/MeetingOverlay.tsx`
   - Import the layout optimizer utility
   - Apply optimization to the layout configuration before rendering
   - Add a flag to differentiate between preview mode and active meeting mode

### Step 3: Add Optimization Toggle (Optional)
1. Add a toggle to enable/disable automatic optimization
   - Allow users to switch between exact layout matching and optimized layout
   - Store preference in the layout configuration

## 3. Technical Approach

### Empty Space Detection Algorithm
1. Build a grid representation of the current layout
2. Identify empty cells in the grid
3. Group adjacent empty cells into regions
4. For each empty region, find adjacent components that could expand into it

### Component Expansion Strategy
1. Prioritize expansion based on component type and importance
2. Consider the following factors for expansion:
   - Component minimum and maximum sizes
   - Adjacent components that could benefit from more space
   - Natural content flow (e.g., notes component benefits more from vertical space)

### Layout Transformation
```typescript
function optimizeLayout(layout: LayoutItem[]): LayoutItem[] {
  // Create a grid representation
  const grid = createGridRepresentation(layout);
  
  // Find empty regions
  const emptyRegions = findEmptyRegions(grid);
  
  // Create expansion opportunities
  const expansions = identifyPossibleExpansions(layout, emptyRegions);
  
  // Apply expansions in priority order
  return applyExpansions(layout, expansions);
}
```

## 4. Testing Strategy

### Unit Tests
- Test layout optimizer with various layout configurations
- Test empty space detection algorithm
- Test component expansion strategies

### Visual Tests
- Compare original and optimized layouts
- Verify components expand in a visually balanced way

### Integration Tests
- Test that optimized layouts render correctly in the overlay
- Test that component functionality remains intact after expansion

## 5. User Experience Considerations

- Optimization should be subtle and not dramatically alter the user's intended layout
- Components should maintain their relative positioning when possible
- Component expansion should prioritize improving usability (e.g., expand text areas to show more content)
- Animation between original and optimized layout may improve user understanding

## 6. Timeline Estimate

| Task | Estimated Time |
|------|----------------|
| Layout optimizer utility | 4 hours |
| MeetingOverlay integration | 2 hours |
| Optimization toggle (optional) | 1 hour |
| Testing and refinement | 3 hours |
| **Total** | **~10 hours** |

---

## Participants Component – Initial Plan

### 1. Feature Overview
Create a Participants page/component that will be rendered when the user clicks the "Participants" section in the sidebar. For now, this component will display a placeholder message indicating where participant management features will go.

### 2. UI/UX Requirements
- Add a new route `/participants` to the app router.
- Update the sidebar so that the "Participants" item is a clickable link (not just a static div) and navigates to `/participants`.
- The Participants component should display a clear placeholder (e.g., "Participants management coming soon") and use a unique `data-testid` for testing.

### 3. Implementation Steps
1. Create `src/pages/Participants.tsx` with a placeholder component and test id `screen-participants`.
2. Update routing in `App.tsx` to add a `/participants` route pointing to the new component.
3. Update the sidebar in `Sidebar.tsx`:
   - Change the "Participants" div to a `NavLink` to `/participants`.
   - Use the `UsersIcon` and label as before.
   - Add `data-testid="sidebar-nav-link-participants"` for testing.

### 4. Next Steps
- Implement real participant management features in the Participants component.
- Add end-to-end and unit tests for navigation and rendering.
- Document test IDs in `screens.md`.


## 📄 Page: Kickoff (Existing)

This page allows the user to define how the meeting should start. The requirements below describe the functionality to be implemented within this existing page.

---

### 🎯 Purpose

Enable users to choose a kickoff style for their meeting. Options include starting immediately or starting with a storytelling session.

---

### 🖼️ UI Layout

**1. Kickoff Mode Selector**
- Label: `How should the meeting start?`
- Type: Radio button group
- Options:
  - `Get Down to Business` → No additional config.
  - `Story Time` → Reveals Story Time Options below.

**2. Story Time Options** *(only shown if "Story Time" is selected)*
- Label: `Choose storyteller method:`
- Type: Radio button group
- Options:
  - `Randomize Storyteller`
  - `Choose Storyteller`

---

### 💾 Data Storage (LocalStorage)

- Key: `kickoffSetting`
- Value format:
```json
{
  "mode": "getDownToBusiness" | "storyTime",
  "storyOption": "random" | "manual" | null
}
```

### Behavior Notes
	•	This is a UI-only implementation.
	•	When user changes selections, the setting should be saved in localStorage under the kickoffSetting key.
	•	No backend communication or other side effects are required.

---

## 🧱 Modular and Robust State Persistence Architecture

This section outlines a refactored architecture for managing persistent state across the application using `localStorage`, aimed at improving modularity, reducing repetition, handling errors safely, and easing long-term maintenance.

### ✅ Goals

* Eliminate repetitive boilerplate for loading/saving state from/to localStorage
* Prevent silent failures due to JSON parsing or writing errors
* Improve maintainability and testability
* Centralize all localStorage access for future flexibility

### 🚀 Key Components

#### 1. `usePersistentState` Hook
A generic React hook that replaces scattered `useState` + `useEffect` + `localStorage` logic:

```tsx
function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options?: {
    validate?: (value: unknown) => value is T;
    migrate?: (legacyData: any) => T;
  }
): [T, React.Dispatch<React.SetStateAction<T>>]
```

#### 2. `storageService.ts`
A centralized service that encapsulates all localStorage operations:

```ts
export const storageService = {
  get<T>(key: string, defaultValue: T, options?): T { ... },
  set<T>(key: string, value: T): boolean { ... },
  remove(key: string): void { ... },
  clear(prefix?: string): void { ... }
};
```

#### 3. Domain-Specific Storage Services
Type-safe interfaces for each data domain in the application:

```ts
// Example for timer config
export const timerConfigService = {
  getTimerConfig(): StoredTimerConfig { ... },
  saveTimerConfig(config: StoredTimerConfig): boolean { ... }
};
```

#### 4. (Optional) `ConfigContext`
A React Context that loads and provides all app configurations:

```tsx
const { layoutConfig, visibilityConfig, timerConfig, kickoffSettings } = useConfig();
```

### 📊 Implementation Benefits

1. **DRY Code**: Eliminate repetitive localStorage access patterns
2. **Error Resilience**: Centralized error handling prevents silent failures  
3. **Type Safety**: Better TypeScript integration with validation
4. **Testability**: Easier to mock for unit testing
5. **Future-Proofing**: Easy to switch to other storage mechanisms

### 📝 Detailed Implementation Plan

A comprehensive implementation plan has been created at:
`/Users/avital.sloma/NewTimerApp/newStandApp/docs/localStorage-architecture.md`

### 🧹 Cleanup Phase

Once the new architecture is implemented and verified:

1. **Remove Legacy Code**:
   - Delete unused `useEffect` hooks that directly interact with localStorage
   - Remove helper functions used for parsing/storing data in components
   - Eliminate duplicate logic that has been abstracted into the new services

2. **Standardize Implementation**:
   - Ensure all components use the same patterns for state persistence
   - Run a codebase search for `localStorage.` to catch any missed instances
   - Update documentation to reflect the new state management approach

This cleanup ensures the codebase stays clean, consistent, and easier to maintain.

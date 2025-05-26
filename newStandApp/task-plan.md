# Feature Plan: Sequential Component Placement in GridLayout

## Objective
When a user adds a new component to the layout, it should be placed to the right of the last existing component in the current row. If the row is full, the next component starts in a new row. This ensures a natural, sequential layout experience.

## Steps

1. **Grid Constraints**
   - Use the grid's column count (default: 12 for react-grid-layout).
   - Default component width (`w`) will be used unless specified otherwise.

2. **Placement Logic**
   - When adding a new component:
     - Find the last row by looking for the highest `y` value among layout items.
     - Within that row, sum the widths (`w`) of all items.
     - If the sum + new component's width ≤ columns, place it to the right (`x = sum of widths in row`).
     - If not, start at `x=0, y=last y + 1` (new row).

3. **Implementation**
   - Create a helper: `findNextGridPosition(existingLayout, componentWidth, columns)`.
   - Use this helper wherever new components are added to the layout.

4. **Testing**
   - Add components with varying widths.
   - Test empty grid, partially filled rows, and full rows.

5. **Documentation**
   - Document the helper and logic in code comments and here in the plan.

## Notes
- This logic will be implemented in the layout configuration logic, likely in or near the component picker or layout state management.
- Edge cases (e.g., oversized components) will be handled gracefully.

---

# Feature Plan: E2E Testing for GridLayout in SetupScreen and MeetingOverlay

## E2E Test Plan: GridLayout (SetupScreen & MeetingOverlay)

### SetupScreen (Editable Configuration)

**Objective:**
- Verify users can add, remove, and persist widgets using checkboxes, and reset the layout.

**Test Scenarios:**
1. **Initial State**
   - Grid layout is visible.
   - Only default widgets (if any) are present.
2. **Add Widgets**
   - Check each widget's checkbox (e.g., Timer, Participants).
   - Assert widget appears in grid.
3. **Remove Widgets**
   - Uncheck widget checkbox.
   - Assert widget disappears from grid.
4. **Persistence**
   - After changes, click save.
   - Reload page.
   - Assert only selected widgets are present.
5. **Reset Layout**
   - Click reset.
   - Assert layout returns to default (e.g., only Timer).
6. **(Optional) Drag-and-Drop**
   - Drag widget, save, reload, verify position.

**Acceptance Criteria:**
- All widget add/remove actions work via checkboxes.
- Layout changes persist after save/reload.
- Reset returns layout to default.
- (Optional) Widget positions persist if re-ordered.

---

### MeetingOverlay (Read-Only Presentation)

**Objective:**
- Verify overlay displays saved layout, is read-only, and can be opened/closed.

**Test Scenarios:**
1. **Open Overlay**
   - Click “Start Meeting” button.
   - Assert overlay appears.
2. **Correct Widgets Displayed**
   - Assert widgets match last saved config.
   - No extra widgets present.
3. **No Edit Controls**
   - Assert checkboxes, add, save, reset buttons are not visible.
4. **Close Overlay**
   - Click close button.
   - Assert overlay disappears.
5. **(Optional) Accessibility/Visual**
   - Assert overlay has correct ARIA attributes and styling.

**Acceptance Criteria:**
- Overlay always matches saved layout.
- No edit controls in overlay.
- Overlay can be opened/closed reliably.


## Objective
Ensure the GridLayout component works as intended in both configuration (SetupScreen) and presentation (MeetingOverlay) modes, with separate E2E tests reflecting their distinct behaviors.

## Locations & Modes
- **SetupScreen**: Editable configuration mode, users can add/move/remove widgets, save layout.
- **MeetingOverlay**: Read-only mode, displays the agreed layout during an active meeting, no edit controls.

## Similarities
- Both render the GridLayout component with the same widgets and layout structure.
- Both display widgets as per the saved configuration.

## Differences
| Aspect                | SetupScreen (Config)         | MeetingOverlay (Overlay)   |
|-----------------------|------------------------------|----------------------------|
| Editing               | Allowed (full controls)      | Not allowed (read-only)    |
| Controls (add/save)   | Visible and enabled          | Hidden/disabled            |
| Entry Point           | `/` (or setup route)         | Overlay, via button        |
| Props to GridLayout   | `disableLayoutControls=false`<br>`inMeetingOverlay=false` | `disableLayoutControls=true`<br>`inMeetingOverlay=true` |
| Data Source           | Editable config, user changes| Saved config, read-only    |
| Persistence           | Can change and save          | Displays last saved        |

## Test Scenarios

### A. SetupScreen Test
- Navigate to the setup/configuration page.
- Add, move, and remove widgets.
- Save the layout.
- Reload and verify the layout persists.
- Ensure controls (add, save, reset) are visible and functional.

### B. MeetingOverlay Test
- Trigger the overlay (e.g., click “Start Meeting” button).
- Verify the overlay appears and displays the correct layout (as saved from setup).
- Ensure no controls for editing are present.
- Overlay can be closed.
- Widgets are displayed as per the saved configuration.

## Acceptance Criteria
- SetupScreen: Layout is editable, controls work, persistence is correct.
- MeetingOverlay: Layout is read-only, matches saved config, no edit controls.


# Feature Plan: Custom Responsive Breakpoints for Sidebar Component

## Objective
Implement custom responsive breakpoints for the `Sidebar` React component, enabling it to independently transition between "standard," "compact," and "mobile" states at 1200px and 900px viewport widths, using Tailwind CSS. Ensure these breakpoints do not affect other components.

## Steps

1. **Tailwind Configuration**
   - Add custom breakpoints to `tailwind.config.js` (e.g., `sb-compact: '1200px'`, `sb-mobile: '900px'`).
   - Use clear, sidebar-specific naming to avoid conflicts.

2. **Sidebar Component Updates**
   - Refactor the `Sidebar` to use the new Tailwind custom breakpoints for conditional styling.
   - Ensure state transitions:
     - ≥1200px: Standard state
     - 900px–1199px: Compact state
     - <900px: Mobile mode
   - Isolate responsive logic to the Sidebar; do not alter global breakpoints or other components.

3. **Testing**
   - Manually and/or programmatically verify Sidebar transitions at exactly 1200px and 900px.
   - Confirm other components’ responsiveness is unaffected.
   - Add or update tests if present (see user rules: minimum 80% coverage, adjacent test files).

4. **Documentation**
   - Update `screens.md` with new data-testid values for each Sidebar state.
   - Document the breakpoints and usage in code comments and in this plan.

5. **Acceptance Criteria**
   - Sidebar transitions at the correct breakpoints.
   - No impact on other components’ responsiveness.
   - Uses Tailwind utility classes and config as primary mechanism.
   - All acceptance criteria from the specification are met.

## Open Questions
- Await design details for "compact" and "mobile" visual states.
- Confirm if any JS resize logic exists that could conflict or should be integrated.


---

# Feature Plan: Transition to Fixed Meeting Screen Layout

## 1. Objective
Transition from a user-configurable, widget-based layout system to a new `MeetingScreen.tsx` component featuring a permanent, fixed layout. Users will control the visibility of predefined sections within this screen via settings on the setup page, rather than directly manipulating widget placement or size.

## 2. Phased Implementation

### Phase 1: Initial Simplification & New `MeetingScreen.tsx`
*   **Objective**: Remove the current dynamic layout system (`GridLayout.tsx`, draggable/resizable widgets) and introduce a basic `MeetingScreen.tsx` that initially only displays the Timer.
*   **Steps**:
    1.  **Create `MeetingScreen.tsx`**:
        *   Location: `src/components/MeetingScreen.tsx` (or a more appropriate directory like `src/screens/`).
        *   Initial Content: Display only the `TimerWidget` (or its core timer logic/UI, styled as it is currently). The Timer should be prominently displayed (e.g., centered or full-width at the top).
    2.  **Refactor `MeetingOverlay.tsx`**:
        *   Modify `MeetingOverlay.tsx` (or the component that currently hosts the meeting view) to render the new `MeetingScreen.tsx` when a meeting starts.
    3.  **Setup Page Simplification (UI/Logic for Layout)**:
        *   Remove UI elements for layout preview, drag-and-drop, resizing, and saving/resetting custom *layout arrangements*.
        *   Retain checkboxes/toggles for selecting desired features (e.g., "Show Timer," "Show Participant List"). These selections should still be saved (e.g., in `MeetingContext.tsx`).
    4.  **Decouple from `GridLayout.tsx`**:
        *   Remove `GridLayout.tsx` from the meeting display flow.
        *   Remove dependencies on `react-grid-layout` if it's primarily used for the customizable layout.
    5.  **State Management (`MeetingContext.tsx` or equivalent)**:
        *   Remove state variables and reducers/actions related to storing and managing custom widget positions (`x`, `y`), sizes (`w`, `h`), and overall layout configurations.
        *   Retain state for *which features/sections* are selected by the user on the setup page.
        *   For Phase 1, `MeetingScreen.tsx` will ignore most of these selections, only showing the Timer.
    6.  **Testing (Phase 1)**:
        *   Verify the new `MeetingScreen.tsx` displays only the Timer correctly.
        *   Verify setup page selections are still saved, even if not yet used by `MeetingScreen.tsx`.
        *   Verify old layout editing UI and functionality are gone.

### Phase 2: Implement Full Fixed Layout & Feature Toggling
*   **Objective**: Based on user-provided design specifications, implement the complete fixed layout within `MeetingScreen.tsx`, where the visibility of different sections (Timer, Participant List, etc.) is controlled by the settings chosen on the setup page.
*   **Steps**:
    1.  **Define Fixed Layout Structure**:
        *   Based on user design, map out the permanent positions and appearances of all potential meeting screen elements (Timer, Participant List, Agenda, Notes, etc.) within `MeetingScreen.tsx`.
    2.  **Conditional Rendering**:
        *   Implement logic in `MeetingScreen.tsx` to conditionally render these predefined sections based on the feature selections saved from the setup page (retrieved from `MeetingContext.tsx` or props).
    3.  **Styling**:
        *   Apply styling to ensure all elements fit harmoniously within the fixed layout.
    4.  **Testing (Phase 2)**:
        *   Test various combinations of feature selections on the setup page and verify `MeetingScreen.tsx` displays the correct sections in their designated fixed positions.
        *   Ensure the layout is responsive if required.

## 3. Current System Components to be Modified/Removed (Progressively)
*   `GridLayout.tsx`: To be removed from the meeting flow, potentially deprecated entirely if not used elsewhere.
*   `src/components/widgets/*.tsx` (e.g., `TimerWidget.tsx`, `ParticipantListWidget.tsx`):
    *   The "widget" concept (as a draggable/resizable item) will be phased out.
    *   The core UI and logic of these components will be integrated directly into `MeetingScreen.tsx` as fixed sections, or `MeetingScreen.tsx` will import and use them as regular, non-dynamic child components.
    *   `TimerWidget.tsx`'s UI/logic will be the first to be integrated/used in `MeetingScreen.tsx` in Phase 1.
*   `MeetingContext.tsx` (or equivalent state management):
    *   State related to custom layout (item positions, sizes) will be removed.
    *   State related to *feature selection* (e.g., `isParticipantListVisible: boolean`) will be retained and used by `MeetingScreen.tsx` in Phase 2.
*   Setup screen component(s) (e.g., `SetupScreen.tsx`):
    *   UI for direct layout manipulation (drag, resize, preview of grid) will be removed.
    *   UI for feature selection (checkboxes/toggles) will be retained.
*   `MeetingOverlay.tsx`: Will be updated to use `MeetingScreen.tsx` as its primary content.

## 4. Task Breakdown (High-Level for Phase 1)
1.  **Update `task-plan.md`** (This step).
2.  **Create `src/components/MeetingScreen.tsx`**: Basic component displaying only the Timer.
3.  **Integrate `TimerWidget` UI/Logic**: Ensure the timer in `MeetingScreen.tsx` looks and functions like the current one.
4.  **Modify `MeetingOverlay.tsx`**: Render `MeetingScreen.tsx` when meeting starts.
5.  **Remove `GridLayout.tsx` from Meeting Flow**: Update `MeetingOverlay.tsx` or parent components.
6.  **Simplify Setup Page UI**: Remove layout editing controls.
7.  **Refactor `MeetingContext.tsx`**: Remove custom layout state.
8.  **Initial Testing**: Verify Phase 1 objectives.

## 5. Future Considerations (Post-Phase 2)
*   Detailed styling and responsiveness of the fixed `MeetingScreen.tsx`.
*   Animations or transitions for showing/hiding sections.

---

# Feature Plan: New Meeting Screen Layout (Sticky Timer & Dynamic Grid)

## Objective
Implement a new layout for the `MeetingScreen.tsx` component. This layout will feature a permanently visible timer component, positioned as a sticky sidebar (left or right). The remaining screen space will display other enabled meeting components in a CSS grid that allows components to flow and wrap automatically.

This plan details the implementation steps following "Phase 2: Implement Full Fixed Layout & Feature Toggling" from the "Transition to Fixed Meeting Screen Layout" plan.

## 1. Prerequisite Assumptions
*   `MeetingScreen.tsx` exists and can conditionally render components based on `MeetingContext` or similar state.
*   Individual meeting components (e.g., `AgendaWidget.tsx`, `NotesWidget.tsx`) are available as standalone React components.
*   The concept of "enabled components" is managed (e.g., via `MeetingContext` and `ComponentPicker.tsx` on the setup screen).

## 2. Implementation Steps

### Step 2.1: Update `MeetingScreen.tsx` Structure
1.  **Main Layout Container**:
    *   Modify `MeetingScreen.tsx` to have a main container (e.g., a `div`). This container will use Flexbox to position the sticky timer sidebar and the main content grid area.
    *   Example structure:
        ```tsx
        // MeetingScreen.tsx
        const MeetingScreen = () => {
          // ... get enabled components from context ...
          return (
            <div style={{ display: 'flex', height: '100vh' }}>
              {/* Timer Sidebar will go here */}
              {/* Main Content Grid will go here */}
            </div>
          );
        };
        ```

2.  **Timer Sidebar Component**:
    *   Create or adapt `TimerWidget.tsx` (or a new `StickyTimerSidebar.tsx`) to be the dedicated timer component.
    *   Style it to be a sidebar (e.g., fixed width, `height: 100vh`, `position: sticky`, `top: 0`).
    *   Decide on left or right placement (e.g., left by default).
    *   Ensure it's always rendered, irrespective of other component selections.
    *   Example:
        ```tsx
        // MeetingScreen.tsx
        // ...
        return (
          <div style={{ display: 'flex', height: 'calc(100vh - TOP_BAR_HEIGHT)' /* Adjust for top bar if any */ }}>
            <div style={{ width: '250px', /* or desired width */ position: 'sticky', top: 'TOP_BAR_HEIGHT', height: 'calc(100vh - TOP_BAR_HEIGHT)', overflowY: 'auto', borderRight: '1px solid #ccc' }}>
              <TimerWidget /> {/* Or StickyTimerSidebar */}
            </div>
            {/* Main Content Grid will go here */}
          </div>
        );
        ```
        *(Note: `TOP_BAR_HEIGHT` is a placeholder for the actual height of any top navigation bar to ensure sticky positioning works correctly below it.)*

3.  **Main Content Grid Area**:
    *   Create a `div` that will serve as the container for the dynamically rendered components.
    *   This container will take up the remaining flexible space next to the timer sidebar.
    *   Style this `div` with CSS Grid:
        *   `display: grid`
        *   `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`
        *   `gap: 1rem` (or desired spacing)
        *   `flex-grow: 1` (to take remaining space in the flex container)
        *   `padding: 1rem`
        *   `overflow-y: auto` (to allow scrolling of components if they exceed viewport height)
    *   Example:
        ```tsx
        // MeetingScreen.tsx
        // ...
        return (
          <div style={{ display: 'flex', height: 'calc(100vh - TOP_BAR_HEIGHT)' }}>
            <div style={{ width: '250px', position: 'sticky', top: 'TOP_BAR_HEIGHT', height: 'calc(100vh - TOP_BAR_HEIGHT)', overflowY: 'auto', borderRight: '1px solid #ccc' }}>
              <TimerWidget />
            </div>
            <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', padding: '1rem', overflowY: 'auto' }}>
              {/* Dynamically rendered components will go here */}
            </div>
          </div>
        );
        ```

### Step 2.2: Dynamic Component Rendering
1.  **Fetch Enabled Components**:
    *   Inside `MeetingScreen.tsx`, retrieve the list of currently enabled/selected components (excluding the Timer, which is always shown) from `MeetingContext` or props.
    *   This list would typically be an array of component identifiers or types.

2.  **Map Identifiers to Actual Components**:
    *   Create a mapping or a switch-case structure that translates component identifiers/types from the context into actual React component instances.
    *   Example:
        ```tsx
        // componentRegistry.ts (or similar)
        import AgendaWidget from './widgets/AgendaWidget';
        import NotesWidget from './widgets/NotesWidget';
        import ParticipantsWidget from './widgets/ParticipantsWidget';
        // ... other component imports

        export const componentMap = {
          agenda: AgendaWidget,
          notes: NotesWidget,
          participants: ParticipantsWidget,
          // ... other components
        };

        // MeetingScreen.tsx
        import { componentMap } from './componentRegistry';
        // ...
        const { enabledComponents } = useMeetingContext(); // e.g., ['agenda', 'notes']

        // ...
            <div style={{ flexGrow: 1, /* ...grid styles... */ }}>
              {enabledComponents.map(componentKey => {
                const Component = componentMap[componentKey];
                return Component ? <Component key={componentKey} /> : null;
              })}
            </div>
        // ...
        ```

3.  **Ensure Components are Standalone**:
    *   Verify that each meeting component (e.g., `AgendaWidget`, `NotesWidget`) is self-contained and can be rendered directly within the grid without requiring specific layout props (like `x`, `y`, `w`, `h` from `react-grid-layout`).
    *   Each component should naturally fill its grid cell or have its own intrinsic sizing that works well within a `minmax(300px, 1fr)` column.

### Step 2.3: Styling and Responsiveness
1.  **Visual Cleanliness**:
    *   Apply consistent padding, margins, and potentially borders/backgrounds to components to ensure a clean look.
    *   Ensure text and interactive elements are clearly legible and accessible.

2.  **Timer Sidebar Styling**:
    *   Ensure the timer sidebar is visually distinct but harmonious with the main content area.
    *   Consider its behavior on very narrow screens (though `auto-fit` and `minmax` in the grid should handle much of the responsiveness). If the sidebar itself needs to collapse or change, that would be an additional requirement. For now, assume it's a fixed width.

3.  **Grid Responsiveness**:
    *   The `repeat(auto-fit, minmax(300px, 1fr))` CSS for `grid-template-columns` is inherently responsive. Test this across various screen widths to ensure components wrap correctly and the layout remains usable.
    *   Individual components within the grid should also be responsive if they contain complex internal structures.

4.  **Scrolling Behavior**:
    *   The timer sidebar should remain sticky. If its content overflows, it should have its own scrollbar (`overflow-y: auto`).
    *   The main content grid area should also scroll independently if the total height of components exceeds the viewport (`overflow-y: auto`). The overall page should ideally not scroll, only these specific regions.

### Step 2.4: Update Setup Screen and Context
1.  **Component Picker (`ComponentPicker.tsx`)**:
    *   Ensure `ComponentPicker.tsx` on the setup screen allows users to select/deselect components that will appear in the main grid area. The Timer should not be an option here as it's always visible.
    *   The state managed by `MeetingContext` should reflect these choices.

2.  **Remove Old Layout Logic**:
    *   Double-check that all remnants of `react-grid-layout` or other previous layout management systems (related to draggable/resizable widgets) are fully removed from `MeetingScreen.tsx`, `MeetingOverlay.tsx`, and `MeetingContext.tsx`.

## 3. Testing
### 3.1. Unit / Component Tests
*   **`MeetingScreen.tsx` Structure**:
    *   Verify the main flex container for sidebar and grid.
    *   Verify the timer sidebar is present.
    *   Verify the content grid area is present.
*   **Conditional Component Rendering**:
    *   Mock `MeetingContext` to provide different sets of enabled components.
    *   Assert that `MeetingScreen.tsx` attempts to render the correct components in the grid area.
*   **Timer Integration**:
    *   Ensure `TimerWidget` (or `StickyTimerSidebar`) is correctly integrated and rendered.

### 3.2. End-to-End (E2E) Tests with Playwright
*   **Test File Location**: Tests will be located in a dedicated folder for this feature, e.g., `e2e/meeting-screen/new-layout.spec.ts` (assuming a root `e2e` directory for Playwright tests, following project guidelines for E2E test organization).
*   **Selectors**: Utilize `data-testid` attributes for element selection as defined in `screens.md` and component implementations, ensuring test stability.
*   **Test Scenarios**:
    *   **Basic Layout and Sticky Timer**:
        *   Navigate to the meeting screen.
        *   Confirm the timer sidebar (e.g., `data-testid="timer-sidebar"`) is visible, correctly positioned (e.g., left), and has the expected dimensions.
        *   Scroll the page (if scrollable) and verify the timer remains sticky.
    *   **Dynamic Content Grid with `ComponentPicker`**:
        *   Go to the setup screen (`data-testid="screen-setup"`).
        *   Use `ComponentPicker` (`data-testid="component-picker"`) to select/deselect various components (e.g., `data-testid="component-picker-checkbox-agenda"`).
        *   Start a meeting.
        *   Verify that the `MeetingScreen` displays the timer AND precisely the selected components in the content grid (`data-testid="meeting-content-grid"`).
        *   Verify components appear in a grid layout.
    *   **Grid Responsiveness & Wrapping**:
        *   With multiple components selected, resize the viewport.
        *   Observe that components in the grid wrap to new rows as available width decreases.
        *   Ensure `minmax` sizing of grid items behaves as expected.
    *   **Overall Responsiveness (Timer and Grid interaction)**:
        *   Test on various viewport sizes (desktop, tablet, potentially mobile if designs specify).
        *   Verify how the timer sidebar and content grid interact (e.g., if the timer stacks on top on mobile).
    *   **Scrolling Behavior**:
        *   If the timer sidebar's content is tall enough to scroll, verify its internal scrollbar functions.
        *   If the content grid has many/tall components, verify its internal scrollbar functions.
        *   Ensure sticky elements behave correctly during these scrolls.
    *   **Max Width and Centering**:
        *   On very wide viewports, confirm the entire meeting screen content is centered and respects any `max-width` constraints.
    *   **Edge Cases**:
        *   No components selected in `ComponentPicker` (only timer should be visible).
        *   All available components selected.
    *   Verify the timer is always visible as a sticky sidebar on the chosen side.
    *   Verify selected components from the setup screen render in the CSS grid area.
    *   Verify components not selected do not render.
2.  **Responsiveness**:
    *   Test on various screen sizes (desktop, tablet, mobile).
    *   Confirm components in the grid wrap correctly.
    *   Confirm the timer sidebar remains sticky and visible.
    *   Confirm scrolling behavior for sidebar and main content area works as expected.
3.  **Component Toggling**:
    *   Go to the setup screen, change component selections.
    *   Start a new meeting and verify the `MeetingScreen` reflects the new selections.
4.  **Edge Cases**:
    *   Test with no components selected (only timer should show).
    *   Test with many components selected to verify wrapping and scrolling.
    *   Test with components that might have varying heights.

## 4. Documentation
*   Update `screens.md` with any new `data-testid` attributes for `MeetingScreen.tsx`, the timer sidebar, and the main content grid area.
*   Document the new layout structure and component rendering logic in code comments.

## 5. Acceptance Criteria
*   Timer component is always visible as a sticky sidebar.
*   Other enabled components are displayed in a responsive CSS grid.
*   `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` is used for the main content area.
*   Components flow and wrap automatically.
*   The layout is visually clean and responsive.
*   Component rendering is dynamic based on configuration.
*   Smooth user experience with appropriate scrolling for overflowing content.


## 6. Refinements and Enhancements

Based on further review, the following improvements should be incorporated:

### 6.1. Mobile Layout Behavior
*   **Single-Column Layout**: On smaller screens (e.g., below a specific breakpoint like 768px), the layout should transition to a single column.
*   **Timer Position on Mobile**: In this single-column mobile view, the Timer component should:
    *   Appear at the top of the column.
    *   Remain sticky to the top of the screen during scrolling.
*   **Implementation**: This will likely require CSS media queries to adjust the flexbox direction (e.g., `flex-direction: column` for the main container) and the Timer's positioning and styling (e.g., `width: 100%`, `position: sticky`, `top: 0`, `z-index` to ensure visibility).

### 6.2. Maximum Page Width
*   **Constrain Width**: The main container of the `MeetingScreen` (the one holding the timer sidebar and the content grid) should have a `max-width` (e.g., `1200px` or `1440px`) to prevent the layout from becoming too stretched on very wide screens.
*   **Centering**: This main container should be centered horizontally on the page, typically using `margin-left: auto; margin-right: auto;`.

### 6.3. Empty State Handling for Content Grid
*   **Placeholder Message**: If no optional components are selected by the user (meaning the main content grid area would be empty), display a user-friendly placeholder message.
*   **Example Message**: "No additional widgets selected. You can add widgets via the setup screen to customize your meeting view."
*   **Styling**: This message should be styled to be noticeable but not obtrusive.

### 6.4. Component Layout and Flow in Grid (Unified Document Look)
*   **Seamless Integration**: Components within the main content grid should appear as parts of a single, continuous document, not as separate cards or boxes.
    *   Avoid distinct borders, drop shadows, or individual backgrounds for components in the grid.
    *   Minimize visual separation (e.g., excessive margins) between components.
*   **Typographic and Spacing Harmony**: Ensure that typography (font sizes, line heights, headings) and spacing (padding within components, margins between logical sections of content) flow naturally from one component's content to the next. The goal is a cohesive reading experience.
*   **Internal Consistency**: While avoiding a "card" look, individual components should still maintain consistent internal padding and structure to ensure their own content is well-organized and readable.

### 6.5. Scrollable Areas Review
*   **Desktop Scrolling**:
    *   The Timer sidebar, if its content exceeds its height, should scroll internally.
    *   The main content grid area should scroll independently of the Timer sidebar if its content exceeds the viewport height.
*   **Mobile Scrolling**:
    *   When the layout is a single column, the entire page content (below the sticky top Timer) will scroll.
    *   Ensure the sticky Timer on mobile does not inadvertently overlap or obscure crucial parts of underlying components during scroll, especially if those components have their own fixed/sticky internal elements (though this should be rare for widgets). Careful `z-index` management might be needed.


## 7. Overall Visual Design Principles for Main Content Area

To achieve a cohesive and integrated user experience in the meeting screen's main content area, the following design principles must be adhered to:

*   **Unified Document Appearance**:
    *   The primary goal is for the main content area (displaying dynamically rendered components/widgets) to feel like a single, seamless page or document.
    *   ❌ **Avoid**:
        *   Card-like containers for individual components (no distinct borders, drop shadows, or separate background colors per component).
        *   Overly pronounced visual separation (e.g., large margins or dividers) between components that breaks the flow.
    *   ✅ **Strive For**:
        *   Minimal to no explicit visual separation between the content of different components.
        *   A natural flow of typography and spacing, creating a continuous reading experience as if all enabled components form one cohesive body of information.

*   **Timer Sidebar Distinction**:
    *   The sticky timer sidebar is an exception and *can* have a distinct visual style (e.g., a subtle border or a slightly different background) to clearly differentiate it from the main content flow and emphasize its persistent nature.

*   **Focus on Content**:
    *   The design should prioritize the clear presentation of content from each component. Styling choices should support readability and ease of use, rather than drawing attention to the component containers themselves.


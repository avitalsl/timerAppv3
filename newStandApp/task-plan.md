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


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


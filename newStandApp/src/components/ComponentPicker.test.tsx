import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComponentPicker from './ComponentPicker';
import { ComponentType } from '../types/layoutTypes';
import type { ComponentDefinition } from '../types/layoutTypes';

// Mock the Checkbox component to simplify testing
vi.mock('./Checkbox', () => ({
  default: (props: any) => (
    <input
      type="checkbox"
      id={props.id}
      checked={props.checked}
      onChange={props.onChange}
      disabled={props.disabled}
      data-testid={props['data-testid']}
    />
  ),
}));

describe('ComponentPicker', () => {
  const mockComponents: ComponentDefinition[] = [
    {
      id: 'timer',
      type: ComponentType.TIMER,
      label: 'Timer',
      isRequired: true,
      isUserSelectableInSetup: true,
      renderPriority: 10,
      defaultSize: { w: 4, h: 3 },
      minSize: { w: 2, h: 2 },
    },
    {
      id: 'participants',
      type: ComponentType.PARTICIPANTS,
      label: 'Participants',
      isRequired: false,
      isUserSelectableInSetup: true,
      renderPriority: 20,
      defaultSize: { w: 4, h: 3 },
      minSize: { w: 2, h: 2 },
    },
    {
      id: 'notes',
      type: ComponentType.NOTES,
      label: 'Notes',
      isRequired: false,
      isUserSelectableInSetup: true,
      renderPriority: 30,
      defaultSize: { w: 4, h: 3 },
      minSize: { w: 2, h: 2 },
    },
    {
      id: 'agenda',
      type: ComponentType.AGENDA,
      label: 'Agenda',
      isRequired: false,
      isUserSelectableInSetup: false, // This should be filtered out
      renderPriority: 40,
      defaultSize: { w: 4, h: 3 },
      minSize: { w: 2, h: 2 },
    },
  ];

  it('renders correctly with the provided components', () => {
    const onToggleMock = vi.fn();
    render(
      <ComponentPicker
        components={mockComponents}
        selectedComponents={['timer']}
        onToggleComponent={onToggleMock}
      />
    );

    // Check that the component rendered
    expect(screen.getByTestId('component-picker')).toBeInTheDocument();
    expect(screen.getByText('Layout Components')).toBeInTheDocument();

    // Check that all selectable components are rendered
    expect(screen.getByTestId('component-picker-item-timer')).toBeInTheDocument();
    expect(screen.getByTestId('component-picker-item-participants')).toBeInTheDocument();
    expect(screen.getByTestId('component-picker-item-notes')).toBeInTheDocument();
    
    // Check that non-selectable components are filtered out
    expect(screen.queryByTestId('component-picker-item-agenda')).not.toBeInTheDocument();
  });

  it('displays the correct selection state for components', () => {
    const onToggleMock = vi.fn();
    render(
      <ComponentPicker
        components={mockComponents}
        selectedComponents={['timer', 'notes']}
        onToggleComponent={onToggleMock}
      />
    );

    // Check which checkboxes are checked
    expect(screen.getByTestId('component-picker-checkbox-timer')).toBeChecked();
    expect(screen.getByTestId('component-picker-checkbox-notes')).toBeChecked();
    expect(screen.getByTestId('component-picker-checkbox-participants')).not.toBeChecked();
  });

  it('disables checkboxes for required components', () => {
    const onToggleMock = vi.fn();
    render(
      <ComponentPicker
        components={mockComponents}
        selectedComponents={['timer']}
        onToggleComponent={onToggleMock}
      />
    );

    // Check that the timer checkbox is disabled (because it's required)
    expect(screen.getByTestId('component-picker-checkbox-timer')).toBeDisabled();
    expect(screen.getByTestId('component-picker-checkbox-participants')).not.toBeDisabled();
    expect(screen.getByTestId('component-picker-checkbox-notes')).not.toBeDisabled();

    // Verify that the required label is shown
    expect(screen.getByText('(Required)')).toBeInTheDocument();
  });

  it('calls onToggleComponent when a checkbox is clicked', () => {
    const onToggleMock = vi.fn();
    render(
      <ComponentPicker
        components={mockComponents}
        selectedComponents={['timer']}
        onToggleComponent={onToggleMock}
      />
    );

    // Click the participants checkbox to select it
    fireEvent.click(screen.getByTestId('component-picker-checkbox-participants'));
    expect(onToggleMock).toHaveBeenCalledWith('participants', true);

    // Click the notes checkbox to select it
    fireEvent.click(screen.getByTestId('component-picker-checkbox-notes'));
    expect(onToggleMock).toHaveBeenCalledWith('notes', true);
  });

  it('calls onToggleComponent with false when deselecting a component', () => {
    const onToggleMock = vi.fn();
    render(
      <ComponentPicker
        components={mockComponents}
        selectedComponents={['timer', 'participants']}
        onToggleComponent={onToggleMock}
      />
    );

    // Click the participants checkbox to deselect it
    fireEvent.click(screen.getByTestId('component-picker-checkbox-participants'));
    expect(onToggleMock).toHaveBeenCalledWith('participants', false);
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AgendaWidget from './AgendaWidget';

// Mock Checkbox component
vi.mock('../Checkbox', () => ({
  default: ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      data-testid="mock-checkbox"
      data-checked={checked}
      onClick={onChange}
    >
      {checked ? 'Checked' : 'Unchecked'}
    </button>
  )
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ListIcon: () => <div data-testid="list-icon">ListIcon</div>,
  PlusIcon: () => <div data-testid="plus-icon">PlusIcon</div>,
}));

describe('AgendaWidget', () => {
  const defaultItems = [
    'Review sprint progress',
    'Discuss blockers',
    'Plan next sprint'
  ];

  it('renders with the correct title and initial items', () => {
    render(<AgendaWidget />);
    
    // Check title
    expect(screen.getByText('Meeting Agenda')).toBeInTheDocument();
    
    // Check all expected items are rendered
    defaultItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
    
    // Check setup-mode class is applied by default
    expect(screen.getByTestId('layout-component-agenda')).toHaveClass('setup-mode');
  });

  it('toggles item checked state when checkbox is clicked', () => {
    render(<AgendaWidget />);
    
    const checkboxes = screen.getAllByTestId('mock-checkbox');
    expect(checkboxes).toHaveLength(3);
    
    // First item should be checked initially (as defined in the initial state)
    expect(checkboxes[0]).toHaveAttribute('data-checked', 'true');
    
    // Second item should be unchecked initially
    expect(checkboxes[1]).toHaveAttribute('data-checked', 'false');
    
    // Click the second checkbox to check it
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toHaveAttribute('data-checked', 'true');
    
    // Click the first checkbox to uncheck it
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toHaveAttribute('data-checked', 'false');
  });

  it('applies proper styling to checked items', () => {
    render(<AgendaWidget />);
    
    // First item is checked in the initial state and should have line-through style
    const items = screen.getAllByText(/Review sprint progress|Discuss blockers|Plan next sprint/);
    expect(items[0].className).toContain('line-through');
    expect(items[0].className).toContain('text-gray-400');
    
    // Other items should not have line-through style
    expect(items[1].className).not.toContain('line-through');
    expect(items[1].className).toContain('text-gray-700');
  });

  it('adds a new item when using the input and button', () => {
    render(<AgendaWidget />);
    
    // Get initial count
    const initialItems = screen.getAllByTestId('mock-checkbox').length;
    
    // Type new item text
    const input = screen.getByTestId('add-agenda-item-input');
    fireEvent.change(input, { target: { value: 'New agenda item' } });
    
    // Click add button
    const addButton = screen.getByTestId('add-agenda-item-button');
    fireEvent.click(addButton);
    
    // Check if new item was added
    const updatedItems = screen.getAllByTestId('mock-checkbox');
    expect(updatedItems.length).toBe(initialItems + 1);
    expect(screen.getByText('New agenda item')).toBeInTheDocument();
    
    // Input should be cleared after adding
    expect(input).toHaveValue('');
  });

  it('adds a new item when pressing Enter', () => {
    render(<AgendaWidget />);
    
    // Get initial count
    const initialItems = screen.getAllByTestId('mock-checkbox').length;
    
    // Type new item text and press Enter
    const input = screen.getByTestId('add-agenda-item-input');
    fireEvent.change(input, { target: { value: 'Another new item' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Check if new item was added
    const updatedItems = screen.getAllByTestId('mock-checkbox');
    expect(updatedItems.length).toBe(initialItems + 1);
    expect(screen.getByText('Another new item')).toBeInTheDocument();
  });

  it('does not add empty items', () => {
    render(<AgendaWidget />);
    
    // Get initial count
    const initialItems = screen.getAllByTestId('mock-checkbox').length;
    
    // Try to add empty item
    const input = screen.getByTestId('add-agenda-item-input');
    fireEvent.change(input, { target: { value: '   ' } }); // Just spaces
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Count should remain the same
    const updatedItems = screen.getAllByTestId('mock-checkbox');
    expect(updatedItems.length).toBe(initialItems);
  });

  it('applies meeting-mode class when mode is set to meeting', () => {
    render(<AgendaWidget mode="meeting" />);
    expect(screen.getByTestId('layout-component-agenda')).toHaveClass('meeting-mode');
    expect(screen.getByTestId('layout-component-agenda')).not.toHaveClass('setup-mode');
  });
});

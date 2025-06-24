import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChecklistTime from '../pages/ChecklistTime';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  CheckSquareIcon: () => <div data-testid="check-square-icon">CheckSquareIcon</div>,
  PlusIcon: () => <div data-testid="plus-icon">PlusIcon</div>,
  TrashIcon: () => <div data-testid="trash-icon">TrashIcon</div>,
}));

describe('ChecklistTime', () => {
  const defaultItems = [
    { id: '1', text: 'Review sprint goals', completed: false },
    { id: '2', text: 'Discuss blockers', completed: false },
    { id: '3', text: 'Assign action items', completed: false },
  ];

  it('renders with the correct title', () => {
    render(<ChecklistTime />);
    
    expect(screen.getByText('Checklist Time')).toBeInTheDocument();
    expect(screen.getByTestId('check-square-icon')).toBeInTheDocument();
  });

  it('renders all default checklist items', () => {
    render(<ChecklistTime />);
    
    defaultItems.forEach(item => {
      expect(screen.getByText(item.text)).toBeInTheDocument();
    });
  });

  it('allows adding a new checklist item', () => {
    render(<ChecklistTime />);
    
    const newItemText = 'New test item';
    const input = screen.getByTestId('new-item-text-input');
    const addButton = screen.getByTestId('add-item-button');
    
    fireEvent.change(input, { target: { value: newItemText } });
    fireEvent.click(addButton);
    
    expect(screen.getByText(newItemText)).toBeInTheDocument();
  });

  it('shows an error when trying to add an empty item', () => {
    render(<ChecklistTime />);
    
    const addButton = screen.getByTestId('add-item-button');
    
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('item-form-error')).toHaveTextContent('Item text is required');
  });

  it('allows toggling item completion status', () => {
    render(<ChecklistTime />);
    
    const firstItemCheckbox = screen.getByTestId('checkbox-item-1');
    const firstItemText = screen.getByText('Review sprint goals');
    
    // Initially not completed
    expect(firstItemCheckbox).not.toBeChecked();
    expect(firstItemText).not.toHaveClass('line-through');
    
    // Toggle to completed
    fireEvent.click(firstItemCheckbox);
    
    // Should now be checked and have line-through style
    expect(firstItemCheckbox).toBeChecked();
    expect(firstItemText).toHaveClass('line-through');
  });

  it('allows removing a checklist item', () => {
    render(<ChecklistTime />);
    
    const secondItemText = 'Discuss blockers';
    expect(screen.getByText(secondItemText)).toBeInTheDocument();
    
    const removeButton = screen.getByTestId('remove-item-2');
    fireEvent.click(removeButton);
    
    expect(screen.queryByText(secondItemText)).not.toBeInTheDocument();
  });

  it('allows adding an item with Enter key', () => {
    render(<ChecklistTime />);
    
    const newItemText = 'Enter key item';
    const input = screen.getByTestId('new-item-text-input');
    
    fireEvent.change(input, { target: { value: newItemText } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText(newItemText)).toBeInTheDocument();
  });
});

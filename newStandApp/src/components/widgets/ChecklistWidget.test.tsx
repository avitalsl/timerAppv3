import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChecklistWidget from './ChecklistWidget';

// Mock the Checkbox component
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
  CheckSquareIcon: () => <div data-testid="check-square-icon">CheckSquareIcon</div>,
  CheckIcon: () => <div data-testid="check-icon">CheckIcon</div>,
}));

describe('ChecklistWidget', () => {
  const defaultItems = [
    'Is everyone present?',
    'Are there any urgent issues to discuss?',
    'Has the agenda been reviewed?',
    'Are all necessary documents prepared?'
  ];
  
  it('renders with the correct title and initial unchecked items', () => {
    render(<ChecklistWidget />);
    
    // Check title
    expect(screen.getByText('Pre-Meeting Checklist')).toBeInTheDocument();
    
    // Check all expected items are rendered
    defaultItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
    
    // Check all checkboxes are initially unchecked
    const checkboxes = screen.getAllByTestId('mock-checkbox');
    expect(checkboxes).toHaveLength(4);
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAttribute('data-checked', 'false');
    });
    
    // All complete message should not be visible initially
    expect(screen.queryByText('All checklist items are complete. Ready to start the meeting!')).not.toBeInTheDocument();
  });

  it('toggles item state when checkbox is clicked', () => {
    render(<ChecklistWidget />);
    
    const checkboxes = screen.getAllByTestId('mock-checkbox');
    
    // Click the first checkbox
    fireEvent.click(checkboxes[0]);
    
    // The first checkbox should now be checked
    expect(checkboxes[0]).toHaveAttribute('data-checked', 'true');
    
    // Other checkboxes should remain unchecked
    expect(checkboxes[1]).toHaveAttribute('data-checked', 'false');
    expect(checkboxes[2]).toHaveAttribute('data-checked', 'false');
    expect(checkboxes[3]).toHaveAttribute('data-checked', 'false');
    
    // All complete message should still not be visible
    expect(screen.queryByText('All checklist items are complete. Ready to start the meeting!')).not.toBeInTheDocument();
  });

  it('shows completion message when all items are checked', () => {
    render(<ChecklistWidget />);
    
    const checkboxes = screen.getAllByTestId('mock-checkbox');
    
    // Click all checkboxes
    checkboxes.forEach(checkbox => {
      fireEvent.click(checkbox);
    });
    
    // All checkboxes should now be checked
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAttribute('data-checked', 'true');
    });
    
    // Now the completion message should be visible
    expect(screen.getByText('All checklist items are complete. Ready to start the meeting!')).toBeInTheDocument();
  });

  it('can toggle items on and off', () => {
    render(<ChecklistWidget />);
    
    const checkboxes = screen.getAllByTestId('mock-checkbox');
    
    // Click the first checkbox to check it
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toHaveAttribute('data-checked', 'true');
    
    // Click it again to uncheck it
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toHaveAttribute('data-checked', 'false');
  });

  it('accepts a mode prop but renders the same UI', () => {
    // The current implementation doesn't use the mode prop for UI differences
    // but we should test that the prop is accepted without errors
    
    const { rerender } = render(<ChecklistWidget mode="setup" />);
    expect(screen.getByTestId('layout-component-checklist')).toBeInTheDocument();
    
    rerender(<ChecklistWidget mode="meeting" />);
    expect(screen.getByTestId('layout-component-checklist')).toBeInTheDocument();
  });
});

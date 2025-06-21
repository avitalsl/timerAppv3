import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotesWidget from './NotesWidget';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  FileTextIcon: () => <div data-testid="file-text-icon">FileTextIcon</div>,
}));

describe('NotesWidget', () => {
  it('renders with the correct title', () => {
    render(<NotesWidget />);
    
    expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
    expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
  });

  it('renders an empty textarea initially', () => {
    render(<NotesWidget />);
    
    const textarea = screen.getByTestId('notes-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('');
    expect(textarea).toHaveAttribute('placeholder', 'Type your meeting notes here...');
  });

  it('allows typing in the textarea', () => {
    render(<NotesWidget />);
    
    const textarea = screen.getByTestId('notes-textarea');
    
    // Simulate user typing in the textarea
    fireEvent.change(textarea, { target: { value: 'These are test notes' } });
    
    // Check that the value was updated
    expect(textarea).toHaveValue('These are test notes');
  });

  it('allows multiline text input', () => {
    render(<NotesWidget />);
    
    const textarea = screen.getByTestId('notes-textarea');
    
    // Simulate user typing multiline text
    const multilineText = 'Line 1\nLine 2\nLine 3';
    fireEvent.change(textarea, { target: { value: multilineText } });
    
    // Check that the value was updated with line breaks
    expect(textarea).toHaveValue(multilineText);
  });

  it('maintains textarea state between renders', () => {
    const { rerender } = render(<NotesWidget />);
    
    const textarea = screen.getByTestId('notes-textarea');
    fireEvent.change(textarea, { target: { value: 'Persistent notes' } });
    
    rerender(<NotesWidget />);
    
    // Value should persist
    expect(textarea).toHaveValue('Persistent notes');
  });

  it('accepts a mode prop without errors', () => {
    // The current implementation doesn't use the mode prop for UI differences
    // but we should test that the prop is accepted without errors
    
    const { rerender } = render(<NotesWidget mode="setup" />);
    expect(screen.getByTestId('layout-component-notes')).toBeInTheDocument();
    
    rerender(<NotesWidget mode="meeting" />);
    expect(screen.getByTestId('layout-component-notes')).toBeInTheDocument();
  });
});

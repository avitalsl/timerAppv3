import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import Checkbox from './Checkbox';

// A simple wrapper component to manage the state of the checkbox
const CheckboxWrapper = () => {
  const [isChecked, setIsChecked] = useState(false);
  const handleChange = vi.fn(() => setIsChecked(!isChecked));

  return (
    <div>
      <Checkbox 
        data-testid="test-checkbox" 
        checked={isChecked} 
        onChange={handleChange} 
      />
      <span data-testid="checked-state">{isChecked ? 'Checked' : 'Unchecked'}</span>
    </div>
  );
};

describe('Checkbox', () => {
  it('should render and be unchecked by default', () => {
    render(<CheckboxWrapper />);
    const checkbox = screen.getByTestId('test-checkbox');
    expect(checkbox).not.toBeChecked();
    expect(screen.getByTestId('checked-state')).toHaveTextContent('Unchecked');
  });

  it('should call onChange and update state when clicked', () => {
    render(<CheckboxWrapper />);
    const checkbox = screen.getByTestId('test-checkbox');
    
    // Click the checkbox
    fireEvent.click(checkbox);

    // The underlying input is now checked
    expect(checkbox).toBeChecked();
    // The state display has updated
    expect(screen.getByTestId('checked-state')).toHaveTextContent('Checked');
  });

  it('should reflect the checked prop', () => {
    render(<Checkbox checked={true} readOnly />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
});

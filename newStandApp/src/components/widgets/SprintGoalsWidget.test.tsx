import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SprintGoalsWidget from './SprintGoalsWidget';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  TargetIcon: () => <div data-testid="target-icon">TargetIcon</div>,
  CheckIcon: () => <div data-testid="check-icon">CheckIcon</div>,
}));

describe('SprintGoalsWidget', () => {
  const defaultGoals = [
    'Complete the user authentication flow',
    'Implement meeting layout customization',
    'Add statistics dashboard',
    'Fix critical bugs in timer functionality'
  ];

  it('renders with the correct title', () => {
    render(<SprintGoalsWidget />);
    
    expect(screen.getByText('Sprint Goals')).toBeInTheDocument();
    expect(screen.getByTestId('target-icon')).toBeInTheDocument();
  });

  it('renders all sprint goals', () => {
    render(<SprintGoalsWidget />);
    
    defaultGoals.forEach(goal => {
      expect(screen.getByText(goal)).toBeInTheDocument();
    });
  });

  it('accepts a mode prop without errors', () => {
    // The current implementation doesn't use the mode prop for UI differences
    // but we should test that the prop is accepted without errors
    
    const { rerender } = render(<SprintGoalsWidget mode="setup" />);
    expect(screen.getByTestId('layout-component-sprint-goals')).toBeInTheDocument();
    
    rerender(<SprintGoalsWidget mode="meeting" />);
    expect(screen.getByTestId('layout-component-sprint-goals')).toBeInTheDocument();
  });
  
  it('shows bullet points for each goal', () => {
    render(<SprintGoalsWidget />);
    
    const bulletPoints = screen.getAllByText('•');
    expect(bulletPoints).toHaveLength(defaultGoals.length);
  });
  
  it('wraps goals in the proper container', () => {
    render(<SprintGoalsWidget />);
    
    // Each goal should be in a bg-primary-sandLightest container
    const goalContainers = screen.getAllByText(/Complete the user|Implement meeting|Add statistics|Fix critical bugs/);
    
    goalContainers.forEach(container => {
      const parentDiv = container.closest('div[class*="bg-primary-sandLightest"]');
      expect(parentDiv).toBeInTheDocument();
    });
  });
});

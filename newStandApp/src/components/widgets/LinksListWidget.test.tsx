import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LinksListWidget from './LinksListWidget';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  LinkIcon: () => <div data-testid="link-icon">LinkIcon</div>,
  ExternalLinkIcon: () => <div data-testid="external-link-icon">ExternalLinkIcon</div>,
}));

describe('LinksListWidget', () => {
  const defaultLinks = [
    { title: 'Sprint Board', url: 'https://example.com/board' },
    { title: 'Design Documents', url: 'https://example.com/design' },
    { title: 'Team Wiki', url: 'https://example.com/wiki' }
  ];

  it('renders with the correct title', () => {
    render(<LinksListWidget />);
    
    expect(screen.getByText('Useful Links')).toBeInTheDocument();
    expect(screen.getByTestId('link-icon')).toBeInTheDocument();
  });

  it('renders all links with correct titles', () => {
    render(<LinksListWidget />);
    
    defaultLinks.forEach(link => {
      expect(screen.getByText(link.title)).toBeInTheDocument();
    });
  });

  it('renders links with correct URLs and attributes', () => {
    render(<LinksListWidget />);
    
    defaultLinks.forEach(link => {
      const linkElement = screen.getByText(link.title).closest('a');
      expect(linkElement).toHaveAttribute('href', link.url);
      expect(linkElement).toHaveAttribute('target', '_blank');
      expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders external link icons for each link', () => {
    render(<LinksListWidget />);
    
    const externalLinkIcons = screen.getAllByTestId('external-link-icon');
    expect(externalLinkIcons).toHaveLength(defaultLinks.length);
  });

  it('accepts a mode prop without errors', () => {
    // The current implementation doesn't use the mode prop for UI differences
    // but we should test that the prop is accepted without errors
    
    const { rerender } = render(<LinksListWidget mode="setup" />);
    expect(screen.getByTestId('layout-component-links')).toBeInTheDocument();
    
    rerender(<LinksListWidget mode="meeting" />);
    expect(screen.getByTestId('layout-component-links')).toBeInTheDocument();
  });
});

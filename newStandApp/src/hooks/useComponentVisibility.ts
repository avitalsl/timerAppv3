// src/hooks/useComponentVisibility.ts
import { useContext } from 'react';
import { ComponentVisibilityContext } from './ComponentVisibilityProvider';

/**
 * Hook to access the component visibility context
 * Must be used within a <ComponentVisibilityProvider>
 */
export function useComponentVisibility() {
  const ctx = useContext(ComponentVisibilityContext);

  if (!ctx) {
    throw new Error('useComponentVisibility must be used within a ComponentVisibilityProvider');
  }

  return ctx;
}
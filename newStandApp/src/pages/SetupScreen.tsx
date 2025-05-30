import { useState, useMemo } from 'react'
// import { useIsMobile } from '../hooks/useIsMobile'; // No longer used
import {
  LayoutIcon,
  RefreshCwIcon,
} from 'lucide-react'

// Import layout configuration components
import ComponentPicker from '../components/ComponentPicker'
// import GridLayout from '../components/GridLayout'; // No longer used
import { useComponentVisibility } from '../hooks/useComponentVisibility'
import { COMPONENT_DEFINITIONS } from '../types/layoutTypes'
// import type { LayoutItem } from '../types/layoutTypes'; // No longer used

const SetupScreen = () => {
    console.log('[DEBUG] SetupScreen rendered');
  
  // Component visibility state
  const { visibilityConfig, toggleComponentVisibility, saveVisibilityConfig, isLoaded } = useComponentVisibility()
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  
  // Initialize selected components based on loaded config
  useMemo(() => {
    if (isLoaded && visibilityConfig) {
      setSelectedComponents(visibilityConfig.visibleComponents)
    }
  }, [isLoaded, visibilityConfig])


  // Handle component selection/deselection for visibility
  const handleToggleComponent = (componentId: string, selected: boolean) => {
    // Update local state
    if (selected) {
      setSelectedComponents(prev => [...prev, componentId]);
    } else {
      setSelectedComponents(prev => prev.filter(id => id !== componentId));
    }
    
    // Use the simplified toggle method from the hook
    toggleComponentVisibility(componentId, selected);
  };
  
  // handleLayoutChange is no longer needed as GridLayout is removed.
  
  // Reset component visibility to default (only timer visible)
  const handleResetLayout = () => {
    // Use the simplified config format
    const visibleComponents = ['timer']; // Only timer is visible by default
    
    // Update the visibility config through the hook
    saveVisibilityConfig({
      visibleComponents
    });
    
    // Update local state
    setSelectedComponents(visibleComponents);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto" data-testid="screen-setup">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div data-testid="setup-layout-config-section">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <LayoutIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-700">
                Layout Configuration
              </h3>
            </div>
            <button
              onClick={handleResetLayout}
              className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
              data-testid="reset-layout-button"
            >
              <RefreshCwIcon className="h-4 w-4 mr-1" />
              Reset Layout
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            Choose which features to display in your meeting.
          </p>
          
          <div className="flex flex-col space-y-6">
            <div className="w-full">
              <ComponentPicker 
                components={COMPONENT_DEFINITIONS} 
                selectedComponents={selectedComponents}
                onToggleComponent={handleToggleComponent}
              />
            </div>

            {/* GridLayout and mobile-specific layout message removed as layout is now fixed */}
            {!isLoaded && (
              <p className="text-sm text-gray-600 mt-4">Loading configuration...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupScreen

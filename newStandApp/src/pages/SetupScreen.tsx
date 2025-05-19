import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile'
import {
  LayoutIcon,
  RefreshCwIcon,
} from 'lucide-react'

// Import layout configuration components
import ComponentPicker from '../components/ComponentPicker'
import GridLayout from '../components/GridLayout'
import { useLayoutStorage } from '../hooks/useLayoutStorage'
import { COMPONENT_DEFINITIONS, DEFAULT_LAYOUT_CONFIG } from '../types/layoutTypes'
import type { LayoutItem } from '../types/layoutTypes'

const SetupScreen = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate()
  console.log('[DEBUG] SetupScreen rendered');
  
  // Layout configuration state
  const { layoutConfig, saveLayout, isLoaded } = useLayoutStorage()
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  
  // Initialize selected components based on loaded config
  useMemo(() => {
    if (isLoaded && layoutConfig) {
      const visibleComponents = Object.entries(layoutConfig.components)
        .filter(([_, component]) => component.visible)
        .map(([id]) => id)
      setSelectedComponents(visibleComponents)
    }
  }, [isLoaded, layoutConfig])

  const handleStartMeeting = () => {
    // We could pass the layout configuration to the meeting screen using state management
    // or URL parameters, but for now we'll just rely on the localStorage persistence
    console.log('[DEBUG] handleStartMeeting called');
    navigate('/meeting')
  }
  
  // Handle component selection/deselection
  const handleToggleComponent = (componentId: string, selected: boolean) => {
    if (selected) {
      setSelectedComponents([...selectedComponents, componentId])
    } else {
      setSelectedComponents(selectedComponents.filter(id => id !== componentId))
    }
    
    // Update layout configuration
    const updatedComponents = { ...layoutConfig.components }
    
    // If component exists, update visibility
    if (updatedComponents[componentId]) {
      updatedComponents[componentId].visible = selected
    } 
    // If component doesn't exist yet, add it with default config
    else if (selected) {
      const componentDef = COMPONENT_DEFINITIONS.find(def => def.id === componentId)
      if (componentDef) {
        updatedComponents[componentId] = {
          type: componentDef.type,
          visible: true
        }
        
        // Add the component to the layout with automatic arrangement
        // With vertical compaction and dragability disabled, the exact x,y coordinates matter less
        // as react-grid-layout will automatically arrange them
        const newLayoutItems = Object.entries(layoutConfig.layouts).reduce(
          (layouts, [breakpoint, items]) => {
            // For automatic arrangement, we just need to add the component with its size
            // The 'x' coordinate is set to 0, but this will be arranged automatically
            // The 'y' coordinate is set to a high number to attempt to place it at the bottom,
            // but the compaction algorithm will move it up as needed
            const placementY = 1000; // A high number that will be adjusted by compaction
            const placementX = 0;    // Will be arranged automatically
            
            layouts[breakpoint] = [
              ...items,
              {
                i: componentId,
                x: placementX,
                y: placementY,
                w: componentDef.defaultSize.w,
                h: componentDef.defaultSize.h,
                minW: componentDef.minSize.w,
                minH: componentDef.minSize.h,
                ...(componentDef.maxSize ? {
                  maxW: componentDef.maxSize.w,
                  maxH: componentDef.maxSize.h
                } : {}),
                static: false
              }
            ]
            return layouts
          },
          {} as { [key: string]: LayoutItem[] }
        )
        
        saveLayout({
          layouts: { ...layoutConfig.layouts, ...newLayoutItems },
          components: updatedComponents
        })
        return
      }
    }
    
    saveLayout({
      ...layoutConfig,
      components: updatedComponents
    })
  }
  
  // Handle layout changes from GridLayout component (only lg layout)
  const handleLayoutChange = (layout: LayoutItem[]) => {
    console.log('[SetupScreen] handleLayoutChange triggered:', { 
      lgLayout: layout,
      time: new Date().toISOString()
    });
    const updatedConfig = {
      ...layoutConfig,
      layouts: { ...layoutConfig.layouts, lg: layout }
    };
    console.log('[SetupScreen] Saving layout config:', updatedConfig);    
    saveLayout(updatedConfig);
  }
  
  // Reset layout to default (only timer)
  const handleResetLayout = () => {
    // Reset to default layout with only the timer
    saveLayout(DEFAULT_LAYOUT_CONFIG)
    
    // Update selected components state to match
    setSelectedComponents(['timer'])
  }

  return (
    <div className="w-full" data-testid="screen-setup">
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
            Choose which components to include in your meeting layout and arrange them as needed.
            The Timer component is always included and cannot be removed.
          </p>
          
          <div className="flex flex-col space-y-6">
            <div className="w-full">
              <ComponentPicker 
                components={COMPONENT_DEFINITIONS} 
                selectedComponents={selectedComponents}
                onToggleComponent={handleToggleComponent}
              />
            </div>

            {isMobile ? (
              <div className="w-full bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-700 text-sm mt-2" data-testid="mobile-layout-info">
                On mobile, components will appear stacked vertically in the meeting. Rearrangement is only available on desktop.
              </div>
            ) : (
              <div className="w-full">
                {isLoaded && (
                  <GridLayout
                    layouts={{ lg: layoutConfig.layouts.lg }}
                    components={layoutConfig.components}
                    onLayoutChange={(layout) => handleLayoutChange(layout)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Participants section removed as it's now available as a configurable component in the layout */}
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleStartMeeting}
            className="px-6 py-2 bg-[#4a9fff] text-white rounded-md hover:bg-[#3a8fee] focus:outline-none focus:ring-2 focus:ring-[#4a9fff] focus:ring-opacity-50"
            data-testid="setup-start-meeting-button"
          >
            Start Meeting
          </button>
        </div>
      </div>
    </div>
  )
}

export default SetupScreen

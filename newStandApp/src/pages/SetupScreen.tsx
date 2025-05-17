import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutIcon,
} from 'lucide-react'

// Import layout configuration components
import ComponentPicker from '../components/ComponentPicker'
import GridLayout from '../components/GridLayout'
import { useLayoutStorage } from '../hooks/useLayoutStorage'
import { COMPONENT_DEFINITIONS } from '../types/layoutTypes'
import type { LayoutItem } from '../types/layoutTypes'

const SetupScreen = () => {
  const navigate = useNavigate()
  
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
  
  // Handle layout changes from GridLayout component
  const handleLayoutChange = (_layout: LayoutItem[], allLayouts: { [key: string]: LayoutItem[] }) => {
    saveLayout({
      ...layoutConfig,
      layouts: allLayouts
    })
  }

  return (
    <div className="w-[95%] max-w-[1200px] mx-auto" data-testid="screen-setup">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div data-testid="setup-layout-config-section">
          <div className="flex items-center mb-3">
            <LayoutIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-700">
              Layout Configuration
            </h3>
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
            
            <div className="w-full">
              {isLoaded && (
                <GridLayout
                  layouts={layoutConfig.layouts}
                  components={layoutConfig.components}
                  onLayoutChange={handleLayoutChange}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Participants section removed as it's now available as a configurable component in the layout */}
        
        <div className="mt-8 flex justify-end">
          <button
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

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useOverlay } from '../contexts/OverlayContext';
import GridLayout from './GridLayout';
import { DEFAULT_LAYOUT_CONFIG } from '../types/layoutTypes';
import type { LayoutConfiguration } from '../types/layoutTypes';

/**
 * Meeting Overlay Component
 * 
 * Renders a full-screen overlay with the current meeting layout
 * Uses React Portal to render outside the normal DOM hierarchy
 */
const MeetingOverlay = () => {
  const { isOverlayVisible, hideOverlay } = useOverlay();
  console.log('MeetingOverlay rendered!')

  // State to hold the main element DOM reference
  const [mainElement, setMainElement] = useState<Element | null>(null);
  // Direct management of layout configuration to ensure freshness
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfiguration>(DEFAULT_LAYOUT_CONFIG);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  
  // Effect to find the main element and refresh layout data when the overlay becomes visible
  useEffect(() => {
    if (isOverlayVisible) {
      // Find the main element - we'll mount our portal here
      const main = document.querySelector('main');
      setMainElement(main);
      
      // CRITICAL FIX: Directly load the latest configuration from localStorage
      try {
        const storedConfig = localStorage.getItem('meetingLayoutConfig');
        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          setLayoutConfig(parsedConfig);
          
          // Log visible components to help with debugging
          const visibleComponents = Object.values(parsedConfig.components)
            .filter((comp: any) => comp.visible).length;
          console.log(`MeetingOverlay: Loaded ${visibleComponents} visible components from localStorage`);
          
          setIsConfigLoaded(true);
        } else {
          console.log('No stored layout configuration found, using default');
          setIsConfigLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load layout configuration:', error);
        setIsConfigLoaded(true); // Continue with default config
      }
    }
  }, [isOverlayVisible]);
  
  // Don't render anything if the overlay is not visible or main element not found
  if (!isOverlayVisible || !mainElement) return null;
  
  // Create overlay content - absolute positioning within the main element
  const overlayContent = (
    <div 
      className="absolute inset-0 z-50 bg-gray-100/95 flex items-center justify-center p-4 overflow-auto"
      data-testid="meeting-overlay"
      style={{ animation: 'fadeIn 0.2s ease-in-out' }}
    >
      <div className="absolute top-4 right-4">
        <button
          onClick={hideOverlay}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          data-testid="meeting-overlay-close"
          aria-label="Close meeting overlay"
        >
          <X className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      <div className="w-[90vw] h-[90vh] flex flex-col bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 mx-auto my-auto p-4" data-component-name="MeetingOverlay">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
      <span className="bg-primary-light h-3 w-3 rounded-full mr-2 animate-pulse"></span>
      Active Meeting
    </h2>
  </div>
  <div className="flex-1 overflow-auto">
    {isConfigLoaded ? (
      <GridLayout 
        layouts={layoutConfig.layouts} 
        components={layoutConfig.components}
        onLayoutChange={() => {}} // Read-only in overlay mode
        disableLayoutControls={true}
        inMeetingOverlay={true}
      />
    ) : (
      <div className="flex justify-center items-center h-40">
        <p>Loading meeting layout...</p>
      </div>
    )}
  </div>
</div>
    </div>
  );

  // Create portal to render the overlay targeting the main element
  return createPortal(overlayContent, mainElement);
};

export default MeetingOverlay;

// Add CSS animation for fade-in effect
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

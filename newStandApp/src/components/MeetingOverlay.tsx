import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useOverlay } from '../contexts/OverlayContext';
import MeetingScreen from './MeetingScreen';
// import { DEFAULT_LAYOUT_CONFIG } from '../types/layoutTypes'; // No longer needed
// import type { LayoutConfiguration } from '../types/layoutTypes'; // No longer needed

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
  // layoutConfig and isConfigLoaded state are no longer needed as MeetingScreen handles its content.
  
  // Effect to find the main element when the overlay becomes visible
  useEffect(() => {
    if (isOverlayVisible) {
      // Find the main element - we'll mount our portal here
      const main = document.querySelector('main');
      setMainElement(main);
      // Logic for loading layoutConfig from localStorage is removed.
      // MeetingScreen will manage its own content, initially just showing the Timer.
    }
  }, [isOverlayVisible]);
  
  // Don't render anything if the overlay is not visible or main element not found
  if (!isOverlayVisible || !mainElement) return null;
  
  // Use overlay mode for styling
  const inMeetingOverlay = true;

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

      <div className={`w-[90vw] h-[90vh] flex flex-col ${inMeetingOverlay ? 'bg-primary-sandLight' : 'bg-white'} rounded-lg shadow-2xl overflow-hidden mx-auto my-auto p-4`} data-component-name="MeetingOverlay">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
      <span className="bg-primary-light h-3 w-3 rounded-full mr-2 animate-pulse"></span>
      Active Meeting
    </h2>
  </div>
  <div className="flex-1 overflow-auto">
    <MeetingScreen />
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

import { useState, useMemo, useEffect } from 'react'
// import { useIsMobile } from '../hooks/useIsMobile'; // No longer used
import {
  LayoutIcon,
  RefreshCwIcon,
  Clock1Icon,
} from 'lucide-react'

// Import layout configuration components
import ComponentPicker from '../components/ComponentPicker'
// import GridLayout from '../components/GridLayout'; // No longer used
import { useComponentVisibility } from '../hooks/useComponentVisibility'
import { COMPONENT_DEFINITIONS } from '../types/layoutTypes'
// import type { LayoutItem } from '../types/layoutTypes'; // No longer used
import { useMeeting } from '../contexts/MeetingContext'
import KickoffScreen from '../components/KickoffScreen'
import { timerConfigStorageService } from '../services/timerConfigStorageService'
import type { StoredTimerConfig } from '../contexts/MeetingContext'

const SetupScreen = () => {
  
  // Component visibility state
  const { visibilityConfig, saveVisibilityConfig, toggleComponentVisibility, isLoaded } = useComponentVisibility()
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  const { dispatch } = useMeeting()
  
  // Get initial timer configuration from storage service
  const initialTimerState = useMemo(() => {
    const config = timerConfigStorageService.getTimerConfig();
    
    // Map the stored config to component state
    return {
      mode: config.mode,
      totalDuration: config.totalDurationMinutes || 15,
      perParticipant: config.durationPerParticipantSeconds || 60,
      allowExtension: config.allowExtension,
      extensionAmount: config.extensionAmountSeconds || 60
    };
  }, []);

  // Timer setup state
  const [mode, setMode] = useState<'fixed' | 'per-participant'>(initialTimerState.mode);
  const [totalDuration, setTotalDuration] = useState<number>(initialTimerState.totalDuration); // in minutes
  const [perParticipant, setPerParticipant] = useState<number>(initialTimerState.perParticipant); // in seconds
  const [allowExtension, setAllowExtension] = useState<boolean>(initialTimerState.allowExtension);
  const [extensionAmount, setExtensionAmount] = useState<number>(initialTimerState.extensionAmount); // in seconds
  
  // Initialize selected components based on loaded config
  useMemo(() => {
    if (isLoaded && visibilityConfig) {
      const userSelectableComponentIds = new Set(
        COMPONENT_DEFINITIONS
          .filter(def => def.isUserSelectableInSetup !== false)
          .map(def => def.id)
      );

      const filteredVisibleComponents = visibilityConfig.visibleComponents.filter(id => 
        userSelectableComponentIds.has(id)
      );
      setSelectedComponents(filteredVisibleComponents);
    }
  }, [isLoaded, visibilityConfig])
  
  // Save timer preferences to storage service when state changes
  useEffect(() => {
    const config: StoredTimerConfig = {
      mode,
      totalDurationMinutes: mode === 'fixed' ? totalDuration : undefined,
      // Store per-participant time in seconds
      durationPerParticipantSeconds: mode === 'per-participant' ? perParticipant : undefined,
      allowExtension,
      // Store extension amount in seconds
      extensionAmountSeconds: allowExtension ? extensionAmount : undefined,
    };
    
    const success = timerConfigStorageService.saveTimerConfig(config);
    
    if (!success) {
      console.error('[SetupScreen] Error saving timer config to storage service');
    }
  }, [mode, totalDuration, perParticipant, allowExtension, extensionAmount]);


  // Handle component selection/deselection for visibility
  const handleToggleComponent = (componentId: string, selected: boolean) => {
    // Use the toggleComponentVisibility method from the hook
    // This will update the visibilityConfig internally
    toggleComponentVisibility(componentId, selected);

    // Get the updated list of visible components
    const updatedVisibleComponents = selected
      ? [...selectedComponents, componentId]
      : selectedComponents.filter(id => id !== componentId);
    
    // Update local state for UI rendering
    setSelectedComponents(updatedVisibleComponents);
    
    // Update MeetingContext for the sidebar to read
    dispatch({
      type: 'UPDATE_SELECTED_COMPONENTS',
      payload: updatedVisibleComponents
    });
  };  
  
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
    
    // Update MeetingContext for the sidebar to read
    dispatch({
      type: 'UPDATE_SELECTED_COMPONENTS',
      payload: visibleComponents
    });
  };

  // Validation (simple)
  const isValidDuration = (val: number) => val > 0 && Number.isFinite(val);
  const isValidExtension = (val: number) => val > 0 && Number.isFinite(val);
  
  return (
    <div className="w-full max-w-[1200px] mx-auto" data-testid="screen-setup">
      {/* Combined Setup Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Layout Configuration Section */}
        <div data-testid="setup-layout-config-section">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <LayoutIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-700">
                Meeting View Setting
              </h3>
            </div>
            <button
              onClick={handleResetLayout}
              className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
              data-testid="reset-layout-button"
            >
              <RefreshCwIcon className="h-4 w-4 mr-1" />
              Reset View
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
        
        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>
        
        {/* Timer Setup Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Clock1Icon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-700">
                Timer Setup
              </h3>
            </div>
          </div>
          
          {/* Timer Mode Selection */}
          <section className="mb-8" data-testid="timer-mode-section">
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="timer-mode"
                  value="fixed"
                  checked={mode === 'fixed'}
                  onChange={() => setMode('fixed')}
                  data-testid="timer-mode-fixed"
                />
                <span className="text-sm text-gray-500">Fixed meeting time</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="timer-mode"
                  value="per-participant"
                  checked={mode === 'per-participant'}
                  onChange={() => setMode('per-participant')}
                  data-testid="timer-mode-per-participant"
                />
                <span className="text-sm text-gray-500">Per participant</span>
              </label>
            </div>
            
            {mode === 'fixed' ? (
              <div className="flex flex-col gap-1">
                <label htmlFor="total-duration" className="text-sm text-gray-500">
                  Total meeting duration (minutes)
                </label>
                <input
                  id="total-duration"
                  type="number"
                  min="1"
                  value={totalDuration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (isValidDuration(val)) setTotalDuration(val);
                  }}
                  className="border rounded px-2 py-1 w-32"
                  data-testid="input-total-duration"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label htmlFor="per-participant" className="text-sm text-gray-500">
                  Time per participant (seconds)
                </label>
                <input
                  id="per-participant"
                  type="number"
                  min="1"
                  value={perParticipant}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (isValidDuration(val)) setPerParticipant(val);
                  }}
                  className="border rounded px-2 py-1 w-32"
                  data-testid="input-per-participant"
                />
              </div>
            )}
          </section>
          
          {/* Time Extension Section */}
          <section className="mb-8" data-testid="time-extension-section">
            <label className="flex items-center gap-2 mb-2 text-sm text-gray-500">
              <input
                type="checkbox"
                checked={allowExtension}
                onChange={(e) => setAllowExtension(e.target.checked)}
                data-testid="toggle-allow-extension"
              />
              Allow adding time during the meeting
            </label>
            
            {allowExtension && (
              <div className="flex flex-col gap-1 ml-6">
                <label htmlFor="extension-amount" className="text-sm text-gray-500">
                  Extension amount (seconds)
                </label>
                <input
                  id="extension-amount"
                  type="number"
                  min="1"
                  value={extensionAmount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (isValidExtension(val)) setExtensionAmount(val);
                  }}
                  className="border rounded px-2 py-1 w-32"
                  data-testid="input-extension-amount"
                />
              </div>
            )}
          </section>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>
        
        {/* Kickoff Settings Section */}
        <div className="kickoff-settings-container">
          {/* Embed the KickoffScreen component directly */}
          <KickoffScreen />
        </div>
      </div>
    </div>
  )
}

export default SetupScreen

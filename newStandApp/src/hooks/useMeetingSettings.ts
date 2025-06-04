import { useState, useCallback } from 'react';
import { meetingSettingsService, type MeetingSettings } from '../services/meetingSettingsService';
import { useComponentVisibility } from '../hooks/useComponentVisibility';
import type { StoredTimerConfig, Participant, KickoffSetting } from '../contexts/MeetingContext';
import type { ParticipantListVisibilityMode } from '../services/participantListVisibilityStorageService';

/**
 * Hook for easy access to meeting settings with reactive updates
 * @returns Methods and state for working with meeting settings
 */
export function useMeetingSettings() {
  const { visibilityConfig } = useComponentVisibility();
  const { visibleComponents } = visibilityConfig;

  // Track the complete settings state
  const [settings, setSettings] = useState<MeetingSettings>(
    meetingSettingsService.getAllSettings(visibleComponents)
  );

  // Refresh all settings from storage
  const refreshSettings = useCallback(() => {
    setSettings(meetingSettingsService.getAllSettings(visibleComponents));
  }, [visibleComponents]);

  // Individual setting updaters with storage sync
  const updateTimerConfig = useCallback((config: StoredTimerConfig) => {
    const success = meetingSettingsService.saveTimerConfig(config);
    if (success) {
      setSettings(prev => ({ ...prev, timerConfig: config }));
    }
    return success;
  }, []);

  const updateParticipants = useCallback((participants: Participant[]) => {
    const success = meetingSettingsService.saveParticipants(participants);
    if (success) {
      setSettings(prev => ({ ...prev, participants }));
    }
    return success;
  }, []);

  const updateKickoffSettings = useCallback((kickoffSettings: KickoffSetting) => {
    const success = meetingSettingsService.saveKickoffSettings(kickoffSettings);
    if (success) {
      setSettings(prev => ({ ...prev, kickoffSettings }));
    }
    return success;
  }, []);

  const updateVisibleComponents = useCallback((newVisibleComponents: string[]) => {
    const success = meetingSettingsService.saveVisibleComponents(newVisibleComponents);
    if (success) {
      setSettings(prev => ({ ...prev, visibleComponents: newVisibleComponents }));
    }
    return success;
  }, []);

  const updateParticipantListVisibilityMode = useCallback((mode: ParticipantListVisibilityMode) => {
    const success = meetingSettingsService.saveParticipantListVisibilityMode(mode);
    if (success) {
      setSettings(prev => ({ ...prev, participantListVisibilityMode: mode }));
    }
    return success;
  }, []);

  return {
    // Current state
    settings,

    // Individual settings for convenience
    timerConfig: settings.timerConfig,
    participants: settings.participants,
    kickoffSettings: settings.kickoffSettings,
    visibleComponents: settings.visibleComponents,
    participantListVisibilityMode: settings.participantListVisibilityMode,

    // Updaters
    refreshSettings,
    updateTimerConfig,
    updateParticipants,
    updateKickoffSettings,
    updateVisibleComponents,
    updateParticipantListVisibilityMode
  };
}
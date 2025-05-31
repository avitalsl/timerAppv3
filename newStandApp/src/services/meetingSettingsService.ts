import { timerConfigStorageService } from './timerConfigStorageService';
import { participantsStorageService } from './participantsStorageService';
import { kickoffSettingsStorageService } from './kickoffSettingsStorageService';
import { componentVisibilityStorageService } from './componentVisibilityStorageService';
import { participantListVisibilityStorageService } from './participantListVisibilityStorageService';
import type { StoredTimerConfig, Participant, KickoffSetting } from '../contexts/MeetingContext';
import type { ComponentVisibilityConfig } from '../types/componentVisibilityTypes';
import type { ParticipantListVisibilityMode } from './participantListVisibilityStorageService';

/**
 * Interface for complete meeting settings
 */
export interface MeetingSettings {
  timerConfig: StoredTimerConfig;
  participants: Participant[];
  kickoffSettings: KickoffSetting;
  visibleComponents: string[];
  participantListVisibilityMode: ParticipantListVisibilityMode;
}

/**
 * Service for accessing all meeting-related settings in one place
 */
export const meetingSettingsService = {
  /**
   * Get all meeting settings at once
   * @returns Complete meeting settings object
   */
  getAllSettings(): MeetingSettings {
    const timerConfig = timerConfigStorageService.getTimerConfig();
    const participants = participantsStorageService.getParticipants();
    const kickoffSettings = kickoffSettingsStorageService.getKickoffSettings();
    const visibilityConfig = componentVisibilityStorageService.getVisibilityConfig();
    const participantListVisibilityMode = participantListVisibilityStorageService.getVisibilityMode();
    console.log('Meeting settings:', {
      timerConfig,
      participants,
      kickoffSettings,
      visibilityConfig,
      participantListVisibilityMode
    });
    return {
      timerConfig,
      participants,
      kickoffSettings,
      visibleComponents: visibilityConfig.visibleComponents,
      participantListVisibilityMode
    };
  },

  /**
   * Save timer configuration
   * @param timerConfig Timer configuration to save
   * @returns true if saved successfully, false otherwise
   */
  saveTimerConfig(timerConfig: StoredTimerConfig): boolean {
    return timerConfigStorageService.saveTimerConfig(timerConfig);
  },

  /**
   * Save participants list
   * @param participants Participants list to save
   * @returns true if saved successfully, false otherwise
   */
  saveParticipants(participants: Participant[]): boolean {
    return participantsStorageService.saveParticipants(participants);
  },

  /**
   * Save kickoff settings
   * @param kickoffSettings Kickoff settings to save
   * @returns true if saved successfully, false otherwise
   */
  saveKickoffSettings(kickoffSettings: KickoffSetting): boolean {
    return kickoffSettingsStorageService.saveKickoffSettings(kickoffSettings);
  },

  /**
   * Save component visibility configuration
   * @param visibleComponents Array of visible component IDs
   * @returns true if saved successfully, false otherwise
   */
  saveVisibleComponents(visibleComponents: string[]): boolean {
    const config: ComponentVisibilityConfig = { visibleComponents };
    return componentVisibilityStorageService.saveVisibilityConfig(config);
  },

  /**
   * Save participant list visibility mode
   * @param mode Visibility mode to save
   * @returns true if saved successfully, false otherwise
   */
  saveParticipantListVisibilityMode(mode: ParticipantListVisibilityMode): boolean {
    return participantListVisibilityStorageService.saveVisibilityMode(mode);
  }
};

// src/services/meetingSettingsService.ts
import { timerConfigStorageService } from './timerConfigStorageService';
import { participantsStorageService } from './participantsStorageService';
import { kickoffSettingsStorageService } from './kickoffSettingsStorageService';
import { participantListVisibilityStorageService } from './participantListVisibilityStorageService';
import type { StoredTimerConfig, Participant, KickoffSetting } from '../contexts/MeetingContext';
import type { ParticipantListVisibilityMode } from './participantListVisibilityStorageService';
import { componentVisibilityStorageService } from './componentVisibilityStorageService'; // ✅ נכון
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
   * @param visibleComponents visible component IDs passed from context
   * @returns Complete meeting settings object
   */
  getAllSettings(visibleComponents: string[]): MeetingSettings {
    const timerConfig = timerConfigStorageService.getTimerConfig();
    const participants = participantsStorageService.getParticipants();
    const kickoffSettings = kickoffSettingsStorageService.getKickoffSettings();
    const participantListVisibilityMode = participantListVisibilityStorageService.getVisibilityMode();

    return {
      timerConfig,
      participants,
      kickoffSettings,
      visibleComponents,
      participantListVisibilityMode
    };
  },

  /**
   * Save timer configuration
   */
  saveTimerConfig(timerConfig: StoredTimerConfig): boolean {
    return timerConfigStorageService.saveTimerConfig(timerConfig);
  },

  /**
   * Save participants list
   */
  saveParticipants(participants: Participant[]): boolean {
    return participantsStorageService.saveParticipants(participants);
  },

  /**
   * Save kickoff settings
   */
  saveKickoffSettings(kickoffSettings: KickoffSetting): boolean {
    return kickoffSettingsStorageService.saveKickoffSettings(kickoffSettings);
  },

  /**
   * Save participant list visibility mode
   */
  saveParticipantListVisibilityMode(mode: ParticipantListVisibilityMode): boolean {
    return participantListVisibilityStorageService.saveVisibilityMode(mode);
  },
  /**
 * Save visible components
 */
  saveVisibleComponents(visibleComponents: string[]): boolean {
    const config = { visibleComponents };
    return componentVisibilityStorageService.saveVisibilityConfig(config);
  },

  
};

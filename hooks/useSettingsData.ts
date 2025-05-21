import { useCallback, useState } from "react";

// Types
export interface Settings {
  id: number;
  work_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  long_break_interval: number;
  auto_start_breaks: boolean;
  auto_start_pomodoros: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  notification_enabled: boolean;
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  id: 1,
  work_duration: 1500, // 25 minutes in seconds
  short_break_duration: 300, // 5 minutes
  long_break_duration: 900, // 15 minutes
  long_break_interval: 4,
  auto_start_breaks: false,
  auto_start_pomodoros: false,
  sound_enabled: true,
  vibration_enabled: true,
  notification_enabled: true,
};

// In-memory mock implementation
const mockSettings: Settings = { ...DEFAULT_SETTINGS };

export function useSettingsData() {
  const [loading, setLoading] = useState(false);

  // Get all settings
  const getSettings = useCallback(async () => {
    try {
      setLoading(true);
      return { ...mockSettings };
    } catch (error) {
      console.error("Error fetching settings:", error);
      return DEFAULT_SETTINGS;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    try {
      setLoading(true);
      Object.assign(mockSettings, updates);
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getSettings,
    updateSettings,
    loading,
  };
}

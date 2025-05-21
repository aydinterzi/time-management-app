import { create } from "zustand";

export interface AppSettings {
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

interface SettingsStore {
  // Settings state
  settings: AppSettings;
  isLoading: boolean;

  // Settings actions
  setSettings: (settings: AppSettings) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Loading state
  setLoading: (isLoading: boolean) => void;
}

// Default settings values
const DEFAULT_SETTINGS: AppSettings = {
  work_duration: 25 * 60, // 25 minutes in seconds
  short_break_duration: 5 * 60, // 5 minutes in seconds
  long_break_duration: 15 * 60, // 15 minutes in seconds
  long_break_interval: 4, // After 4 pomodoros
  auto_start_breaks: false,
  auto_start_pomodoros: false,
  sound_enabled: true,
  vibration_enabled: true,
  notification_enabled: true,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  // Initial settings state
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  // Settings state setters
  setSettings: (settings) => set({ settings }),
  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),

  // Loading state
  setLoading: (isLoading) => set({ isLoading }),
}));

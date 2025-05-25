import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsState {
  // Pomodoro cycle settings
  long_break_interval: number; // Number of work sessions before a long break (2-8)

  // Automatic behavior settings
  auto_start_breaks: boolean; // Auto-start break timers after work sessions
  auto_start_pomodoros: boolean; // Auto-start work timers after breaks

  // Actions
  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => void;
  updateMultipleSettings: (updates: Partial<SettingsState>) => void;
  resetToDefaults: () => void;
  isLoading: boolean;
}

const defaultSettings = {
  long_break_interval: 4,
  auto_start_breaks: false,
  auto_start_pomodoros: false,
  isLoading: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      updateSetting: <K extends keyof SettingsState>(
        key: K,
        value: SettingsState[K]
      ) => {
        set({ isLoading: true });

        setTimeout(() => {
          set({ [key]: value, isLoading: false });
        }, 100);
      },

      updateMultipleSettings: (updates: Partial<SettingsState>) => {
        set({ isLoading: true });

        setTimeout(() => {
          set({ ...updates, isLoading: false });
        }, 100);
      },

      resetToDefaults: () => {
        set({ isLoading: true });

        setTimeout(() => {
          set({ ...defaultSettings, isLoading: false });
        }, 100);
      },
    }),
    {
      name: "pomodoro-settings",
      partialize: (state) => {
        // Only persist actual settings, not actions or loading state
        const {
          updateSetting,
          updateMultipleSettings,
          resetToDefaults,
          isLoading,
          ...settings
        } = state;
        return settings;
      },
    }
  )
);

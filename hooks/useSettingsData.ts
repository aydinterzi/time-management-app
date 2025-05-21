import { useCallback } from "react";
import { useSettingsOperations } from "../contexts/DatabaseContext";
import { AppSettings, useSettingsStore } from "../stores/settingsStore";

export function useSettingsData() {
  const settingsOperations = useSettingsOperations();
  const {
    setSettings,
    updateSettings: updateStoreSettings,
    setLoading,
  } = useSettingsStore();

  // Fetch settings from the database
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await settingsOperations.getSettings();
      if (settings) {
        setSettings(settings as AppSettings);
        return settings;
      }
      return null;
    } catch (error) {
      console.error("Error fetching settings:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [settingsOperations, setSettings, setLoading]);

  // Update settings in database and store
  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      try {
        setLoading(true);
        const success = await settingsOperations.updateSettings(updates);

        if (success) {
          updateStoreSettings(updates);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating settings:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [settingsOperations, updateStoreSettings, setLoading]
  );

  return {
    fetchSettings,
    updateSettings,
  };
}

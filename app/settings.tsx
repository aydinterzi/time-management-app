import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingsStore } from "../stores/settingsStore";

export default function SettingsScreen() {
  const router = useRouter();

  // Force dark theme
  const isDark = true;

  // Get settings from Zustand store
  const {
    long_break_interval,
    auto_start_breaks,
    auto_start_pomodoros,
    updateSetting,
    isLoading,
  } = useSettingsStore();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Settings</Text>
          {isLoading && (
            <View style={styles.loadingIndicator}>
              <Text style={styles.loadingText}>Saving...</Text>
            </View>
          )}
        </View>

        {/* Pomodoro Cycle Settings */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="repeat" size={24} color="#ff9800" />
            <Text style={styles.sectionTitle}>Pomodoro Cycle</Text>
          </View>

          {/* Long Break Interval */}
          <View style={styles.settingItem}>
            <View style={styles.settingHeader}>
              <MaterialIcons name="schedule" size={20} color="#ff9800" />
              <Text style={styles.settingTitle}>
                Long break after {long_break_interval} work sessions
              </Text>
            </View>
            <Text style={styles.settingDescription}>
              Configure how many work sessions before taking a long break
            </Text>
            <Slider
              value={long_break_interval}
              onValueChange={() => {}} // No live preview, only save on complete
              onSlidingComplete={(value) =>
                updateSetting("long_break_interval", Math.round(value))
              }
              minimumValue={2}
              maximumValue={8}
              step={1}
              minimumTrackTintColor="#625df5"
              maximumTrackTintColor="#333"
              thumbTintColor="#625df5"
              style={styles.slider}
            />
            <Text style={styles.sliderHelper}>
              Range: 2-8 sessions (Current: {long_break_interval})
            </Text>
          </View>
        </View>

        {/* Automatic Behavior Settings */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="play-arrow" size={24} color="#4caf50" />
            <Text style={styles.sectionTitle}>Automatic Behavior</Text>
          </View>

          {/* Auto-start Breaks */}
          <View style={styles.switchSetting}>
            <View style={styles.switchSettingInfo}>
              <MaterialIcons
                name="pause-circle-filled"
                size={20}
                color="#4caf50"
              />
              <View style={styles.switchSettingText}>
                <Text style={styles.settingTitle}>Auto-start Breaks</Text>
                <Text style={styles.settingDescription}>
                  Automatically start break timers when work sessions complete
                </Text>
              </View>
            </View>
            <Switch
              value={auto_start_breaks}
              onValueChange={(value) =>
                updateSetting("auto_start_breaks", value)
              }
              trackColor={{ false: "#333", true: "#625df5" }}
              thumbColor="#fff"
            />
          </View>

          {/* Auto-start Pomodoros */}
          <View style={styles.switchSetting}>
            <View style={styles.switchSettingInfo}>
              <MaterialIcons
                name="play-circle-filled"
                size={20}
                color="#ff5252"
              />
              <View style={styles.switchSettingText}>
                <Text style={styles.settingTitle}>
                  Auto-start Work Sessions
                </Text>
                <Text style={styles.settingDescription}>
                  Automatically start work timers when breaks complete
                </Text>
              </View>
            </View>
            <Switch
              value={auto_start_pomodoros}
              onValueChange={(value) =>
                updateSetting("auto_start_pomodoros", value)
              }
              trackColor={{ false: "#333", true: "#625df5" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Reset Settings Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="restore" size={24} color="#f44336" />
            <Text style={styles.sectionTitle}>Reset Settings</Text>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              Alert.alert(
                "Reset Settings",
                "Are you sure you want to reset all settings to their default values? This action cannot be undone.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => {
                      const { resetToDefaults } = useSettingsStore.getState();
                      resetToDefaults();
                    },
                  },
                ]
              );
            }}
          >
            <MaterialIcons name="refresh" size={20} color="#f44336" />
            <Text style={styles.resetButtonText}>
              Reset All Settings to Defaults
            </Text>
          </TouchableOpacity>
          <Text style={styles.settingDescription}>
            This will reset automatic behavior settings to their default values
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContainer: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingIndicator: {
    backgroundColor: "#625df5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  settingItem: {
    marginBottom: 10,
  },
  settingSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 14,
    color: "#aaa",
    marginLeft: 32,
    lineHeight: 20,
  },
  slider: {
    marginHorizontal: 32,
    marginVertical: 20,
    height: 40,
  },
  sliderHelper: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginBottom: 10,
  },
  switchSetting: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchSettingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  switchSettingText: {
    marginLeft: 12,
    flex: 1,
  },
  navigateContainer: {
    marginLeft: 10,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2d1b1b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#4a2a2a",
  },
  resetButtonText: {
    color: "#f44336",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

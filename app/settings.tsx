import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DatabaseExample from "../components/DatabaseExample";

export default function SettingsScreen() {
  const router = useRouter();
  const [showDatabaseExample, setShowDatabaseExample] = useState(false);

  // Force dark theme
  const isDark = true;

  // Navigate to timer screen for timer settings
  const goToTimerSettings = () => {
    router.navigate("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>Settings</Text>

        {/* Timer Settings Section - Redirects to Timer Screen */}
        <TouchableOpacity onPress={goToTimerSettings}>
          <View style={styles.settingSection}>
            <View style={styles.settingHeader}>
              <MaterialIcons name="timer" size={24} color="#625df5" />
              <Text style={styles.settingTitle}>Timer Settings</Text>
            </View>
            <Text style={styles.settingDescription}>
              Adjust work and break durations directly from the timer screen
            </Text>
            <View style={styles.navigateContainer}>
              <MaterialIcons name="arrow-forward" size={20} color="#aaa" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Database Testing Section */}
        <TouchableOpacity onPress={() => setShowDatabaseExample(true)}>
          <View style={styles.settingSection}>
            <View style={styles.settingHeader}>
              <MaterialIcons name="storage" size={24} color="#4caf50" />
              <Text style={styles.settingTitle}>Database Testing</Text>
            </View>
            <Text style={styles.settingDescription}>
              Test local database operations with Drizzle and SQLite
            </Text>
            <View style={styles.navigateContainer}>
              <MaterialIcons name="arrow-forward" size={20} color="#aaa" />
            </View>
          </View>
        </TouchableOpacity>

        {/* About Section - Placeholder for future settings */}
        <View style={styles.settingSection}>
          <View style={styles.settingHeader}>
            <MaterialIcons name="info" size={24} color="#ff9800" />
            <Text style={styles.settingTitle}>About</Text>
          </View>
          <Text style={styles.settingDescription}>
            Time Management App v1.0 - Now with local-first database storage
          </Text>
        </View>
      </ScrollView>

      {/* Database Example Modal */}
      <Modal
        visible={showDatabaseExample}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDatabaseExample(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowDatabaseExample(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <DatabaseExample />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
    marginTop: 12,
  },
  settingSection: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 14,
    color: "#aaa",
    marginLeft: 36,
  },
  navigateContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
});

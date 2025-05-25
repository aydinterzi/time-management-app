import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Timer from "../components/Timer";
import { useSessionsData } from "../hooks/useSessionsData";
import { useSettingsData } from "../hooks/useSettingsData";
import { useTasksData } from "../hooks/useTasksData";
import { AppSettings } from "../stores/settingsStore";
import { Task, useTaskStore } from "../stores/taskStore";
import { useTimerStore } from "../stores/timerStore";

export default function TimerScreen() {
  // Force dark theme
  const isDark = true;

  // Timer state
  const {
    type,
    duration,
    activeTaskId,
    completedSessions,
    setType,
    setDuration,
    setActiveTaskId,
    setSessionId,
    incrementCompletedSessions,
    resetCompletedSessions,
    reset: resetTimer,
  } = useTimerStore();

  // Task operations and global store
  const { fetchTasks, incrementPomodoro } = useTasksData();
  const { tasks } = useTaskStore();

  // Session operations
  const { startSession, completeSession } = useSessionsData();

  // Settings operations
  const { getSettings, updateSettings } = useSettingsData();

  // Timer settings
  const [workMinutes, setWorkMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  // Component state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showTaskSelect, setShowTaskSelect] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(
    null
  );

  // Load settings and tasks on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Refresh tasks when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
    }, [])
  );

  // Watch for active task changes
  useEffect(() => {
    if (activeTaskId && tasks.length > 0) {
      const task = tasks.find((t) => t.id === activeTaskId);
      setActiveTask(task || null);
    } else {
      setActiveTask(null);
    }
  }, [activeTaskId, tasks]);

  // Load data from database
  const loadInitialData = async () => {
    try {
      // Load settings
      const settings = await getSettings();
      if (settings) {
        const appSettings = settings as AppSettings;
        setWorkMinutes(appSettings.work_duration / 60);
        setShortBreakMinutes(appSettings.short_break_duration / 60);
        setLongBreakMinutes(appSettings.long_break_duration / 60);

        // Set timer duration based on the current timer type
        if (type === "work") {
          setDuration(appSettings.work_duration);
        } else if (type === "short_break") {
          setDuration(appSettings.short_break_duration);
        } else if (type === "long_break") {
          setDuration(appSettings.long_break_duration);
        }
      }

      // Load tasks
      await loadTasks();
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  // Load tasks from the database
  const loadTasks = async () => {
    try {
      await fetchTasks(true);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  // Handle timer completion
  const handleTimerComplete = async () => {
    try {
      console.log(`Timer completed: ${type} session`);

      // Handle work session completion
      if (type === "work") {
        // Show completion message
        setCompletionMessage("🎉 Focus session completed! Great work!");

        // Increment pomodoro count for the task if one is selected
        if (activeTaskId) {
          await incrementPomodoro(activeTaskId);
        }

        // Increment completed sessions counter
        incrementCompletedSessions();

        // Create and complete a work session for statistics
        const sessionId = await startSession(activeTaskId, "work", duration);
        if (sessionId) {
          await completeSession(sessionId);
        }

        // Determine next break type based on completed sessions
        // Every 4th session gets a long break, others get short break
        const nextIsLongBreak = (completedSessions + 1) % 4 === 0;
        const nextType = nextIsLongBreak ? "long_break" : "short_break";
        const nextDuration = nextIsLongBreak
          ? longBreakMinutes * 60
          : shortBreakMinutes * 60;

        console.log(
          `Switching to ${nextType} (${
            nextIsLongBreak ? longBreakMinutes : shortBreakMinutes
          } minutes)`
        );

        // Switch to break
        setTimeout(() => {
          setType(nextType);
          setDuration(nextDuration);
          resetTimer();
        }, 2000);

        // Update completion message for break
        setTimeout(() => {
          setCompletionMessage(
            nextIsLongBreak
              ? "☕ Time for a long break! You've earned it."
              : "☕ Time for a short break! Step away from your work."
          );
        }, 2000);
      } else {
        // Handle break session completion
        console.log(`Break completed, switching to work session`);

        // Show completion message
        setCompletionMessage("✨ Break time is over! Ready to focus?");

        // Create and complete a break session for statistics
        const sessionId = await startSession(null, type, duration);
        if (sessionId) {
          await completeSession(sessionId);
        }

        // Switch back to work
        setTimeout(() => {
          setType("work");
          setDuration(workMinutes * 60);
          resetTimer();
        }, 2000);

        // Update completion message for work
        setTimeout(() => {
          setCompletionMessage("🚀 Ready for your next focus session!");
        }, 2000);
      }

      // Clear completion message after 5 seconds
      setTimeout(() => {
        setCompletionMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Error handling timer completion:", error);
    }
  };

  // Toggle task selection panel
  const toggleTaskSelect = () => {
    setShowTaskSelect(!showTaskSelect);
    setShowTimerSettings(false);
  };

  // Toggle timer settings panel
  const toggleTimerSettings = () => {
    setShowTimerSettings(!showTimerSettings);
    setShowTaskSelect(false);
  };

  // Handle task selection for the timer
  const handleTaskSelect = (task: Task) => {
    setActiveTaskId(task.id);
    setShowTaskSelect(false);
  };

  // Update timer setting and save to storage
  const updateTimerSetting = async (settingType: string, minutes: number) => {
    try {
      const seconds = minutes * 60;
      const updates: Partial<AppSettings> = {};

      if (settingType === "work") {
        setWorkMinutes(minutes);
        updates.work_duration = seconds;
        // If we're currently in a work session, update the timer immediately
        if (type === "work") {
          setDuration(seconds);
        }
      } else if (settingType === "short_break") {
        setShortBreakMinutes(minutes);
        updates.short_break_duration = seconds;
        // If we're currently in a short break, update the timer immediately
        if (type === "short_break") {
          setDuration(seconds);
        }
      } else if (settingType === "long_break") {
        setLongBreakMinutes(minutes);
        updates.long_break_duration = seconds;
        // If we're currently in a long break, update the timer immediately
        if (type === "long_break") {
          setDuration(seconds);
        }
      }

      // Save settings to storage
      await updateSettings(updates);
    } catch (error) {
      console.error("Error updating timer settings:", error);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.timerContainer}>
        <Timer onComplete={handleTimerComplete} />

        {/* Completion Message */}
        {completionMessage && (
          <View
            style={[
              styles.completionMessage,
              isDark
                ? styles.darkCompletionMessage
                : styles.lightCompletionMessage,
            ]}
          >
            <Text
              style={[
                styles.completionText,
                isDark ? styles.darkText : styles.lightText,
              ]}
            >
              {completionMessage}
            </Text>
          </View>
        )}

        {/* Session Progress Indicator */}
        <View style={styles.sessionIndicator}>
          <Text
            style={[
              styles.sessionText,
              isDark ? styles.darkSubText : styles.lightSubText,
            ]}
          >
            Session {completedSessions + 1} •{" "}
            {type === "work"
              ? "Focus Time"
              : type === "short_break"
              ? "Short Break"
              : "Long Break"}
          </Text>
          <View style={styles.sessionDots}>
            {[1, 2, 3, 4].map((num) => (
              <View
                key={num}
                style={[
                  styles.sessionDot,
                  completedSessions % 4 >= num - 1 && styles.sessionDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Timer Settings Button */}
        <TouchableOpacity
          style={[
            styles.timerSettingsButton,
            isDark ? styles.darkButton : styles.lightButton,
          ]}
          onPress={toggleTimerSettings}
        >
          <MaterialIcons
            name="tune"
            size={20}
            color={isDark ? "#fff" : "#333"}
          />
          <Text
            style={[
              styles.buttonText,
              isDark ? styles.darkText : styles.lightText,
            ]}
          >
            Adjust Timer
          </Text>
        </TouchableOpacity>

        {/* Active Task Display */}
        <TouchableOpacity
          style={[
            styles.activeTaskButton,
            isDark ? styles.darkActiveTaskButton : styles.lightActiveTaskButton,
          ]}
          onPress={toggleTaskSelect}
        >
          {activeTask ? (
            <View style={styles.activeTaskInfo}>
              <Text
                style={[
                  styles.activeTaskLabel,
                  isDark ? styles.darkText : styles.lightText,
                ]}
              >
                Current Task:
              </Text>
              <Text
                style={[
                  styles.activeTaskTitle,
                  isDark ? styles.darkText : styles.lightText,
                ]}
              >
                {activeTask.title}
              </Text>
            </View>
          ) : (
            <View style={styles.activeTaskInfo}>
              <Text
                style={[
                  styles.activeTaskLabel,
                  isDark ? styles.darkText : styles.lightText,
                ]}
              >
                No Task Selected
              </Text>
              <Text
                style={[
                  styles.activeTaskTitle,
                  isDark ? styles.darkText : styles.lightText,
                ]}
              >
                Tap to select a task
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Timer Settings Panel */}
      {showTimerSettings && (
        <View
          style={[
            styles.taskSelectPanel,
            isDark ? styles.darkTaskPanel : styles.lightTaskPanel,
          ]}
        >
          <View style={styles.taskSelectHeader}>
            <Text
              style={[
                styles.taskSelectTitle,
                isDark ? styles.darkText : styles.lightText,
              ]}
            >
              Timer Settings
            </Text>
            <TouchableOpacity onPress={toggleTimerSettings}>
              <MaterialIcons
                name="close"
                size={24}
                color={isDark ? "#fff" : "#333"}
              />
            </TouchableOpacity>
          </View>

          {/* Work Duration */}
          <View style={styles.settingItem}>
            <View style={styles.settingHeader}>
              <MaterialIcons name="work" size={20} color="#ff5252" />
              <Text
                style={[
                  styles.settingTitle,
                  isDark ? styles.darkText : styles.lightText,
                ]}
              >
                Work Duration: {workMinutes} min
              </Text>
            </View>
            <Slider
              value={workMinutes}
              onValueChange={(value) => setWorkMinutes(Math.round(value))}
              onSlidingComplete={(value) =>
                updateTimerSetting("work", Math.round(value))
              }
              minimumValue={1}
              maximumValue={60}
              step={1}
              minimumTrackTintColor="#625df5"
              maximumTrackTintColor="#333"
              thumbTintColor="#625df5"
              style={{ width: "100%", height: 40 }}
            />
          </View>

          {/* Short Break Duration */}
          <View style={styles.settingItem}>
            <View style={styles.settingHeader}>
              <MaterialIcons name="coffee" size={20} color="#4caf50" />
              <Text
                style={[
                  styles.settingTitle,
                  isDark ? styles.darkText : styles.lightText,
                ]}
              >
                Short Break: {shortBreakMinutes} min
              </Text>
            </View>
            <Slider
              value={shortBreakMinutes}
              onValueChange={(value) => setShortBreakMinutes(Math.round(value))}
              onSlidingComplete={(value) =>
                updateTimerSetting("short_break", Math.round(value))
              }
              minimumValue={1}
              maximumValue={15}
              step={1}
              minimumTrackTintColor="#625df5"
              maximumTrackTintColor="#333"
              thumbTintColor="#625df5"
              style={{ width: "100%", height: 40 }}
            />
          </View>

          {/* Long Break Duration */}
          <View style={styles.settingItem}>
            <View style={styles.settingHeader}>
              <MaterialIcons name="free-breakfast" size={20} color="#2196f3" />
              <Text
                style={[
                  styles.settingTitle,
                  isDark ? styles.darkText : styles.lightText,
                ]}
              >
                Long Break: {longBreakMinutes} min
              </Text>
            </View>
            <Slider
              value={longBreakMinutes}
              onValueChange={(value) => setLongBreakMinutes(Math.round(value))}
              onSlidingComplete={(value) =>
                updateTimerSetting("long_break", Math.round(value))
              }
              minimumValue={5}
              maximumValue={30}
              step={1}
              minimumTrackTintColor="#625df5"
              maximumTrackTintColor="#333"
              thumbTintColor="#625df5"
              style={{ width: "100%", height: 40 }}
            />
          </View>
        </View>
      )}

      {/* Task Selection Panel */}
      {showTaskSelect && (
        <View
          style={[
            styles.taskSelectPanel,
            isDark ? styles.darkTaskPanel : styles.lightTaskPanel,
          ]}
        >
          <View style={styles.taskSelectHeader}>
            <Text
              style={[
                styles.taskSelectTitle,
                isDark ? styles.darkText : styles.lightText,
              ]}
            >
              Select a Task
            </Text>
            <TouchableOpacity onPress={toggleTaskSelect}>
              <MaterialIcons
                name="close"
                size={24}
                color={isDark ? "#fff" : "#333"}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.taskScrollView}
            showsVerticalScrollIndicator={false}
          >
            {tasks.filter((task) => !task.completed).length > 0 ? (
              tasks
                .filter((task) => !task.completed)
                .map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.taskSelectItem,
                      isDark ? styles.darkTaskItem : styles.lightTaskItem,
                      activeTaskId === task.id && styles.taskSelectItemActive,
                    ]}
                    onPress={() => handleTaskSelect(task)}
                  >
                    <Text
                      style={[
                        styles.taskSelectItemTitle,
                        isDark ? styles.darkText : styles.lightText,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View style={styles.taskSelectItemMeta}>
                      <Text
                        style={[
                          styles.taskSelectItemCount,
                          isDark ? styles.darkSubText : styles.lightSubText,
                        ]}
                      >
                        {task.completed_pomodoros}/{task.estimated_pomodoros}{" "}
                        pomodoros
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
            ) : (
              <View style={styles.emptyTasksMessage}>
                <Text
                  style={[
                    styles.emptyTasksText,
                    isDark ? styles.darkSubText : styles.lightSubText,
                  ]}
                >
                  No tasks available. Add tasks in the Tasks tab.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  lightContainer: {
    backgroundColor: "#f5f5f5",
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sessionText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  sessionDots: {
    flexDirection: "row",
    marginLeft: 8,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    marginHorizontal: 2,
  },
  sessionDotActive: {
    backgroundColor: "#625df5",
  },
  timerSettingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  darkButton: {
    backgroundColor: "#2d2d2d",
  },
  lightButton: {
    backgroundColor: "#e0e0e0",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  activeTaskButton: {
    marginTop: 10,
    padding: 16,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  darkActiveTaskButton: {
    backgroundColor: "#1e1e1e",
  },
  lightActiveTaskButton: {
    backgroundColor: "#e0e0e0",
  },
  activeTaskInfo: {
    alignItems: "center",
  },
  activeTaskLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  activeTaskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  darkText: {
    color: "#fff",
  },
  lightText: {
    color: "#333",
  },
  darkSubText: {
    color: "#aaa",
  },
  lightSubText: {
    color: "#666",
  },
  taskSelectPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "60%",
  },
  darkTaskPanel: {
    backgroundColor: "#1e1e1e",
  },
  lightTaskPanel: {
    backgroundColor: "#e0e0e0",
  },
  taskSelectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  taskSelectTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  taskSelectItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  darkTaskItem: {
    backgroundColor: "#2d2d2d",
  },
  lightTaskItem: {
    backgroundColor: "#f0f0f0",
  },
  taskSelectItemActive: {
    backgroundColor: "#625df5",
  },
  taskSelectItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskSelectItemMeta: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  taskSelectItemCount: {
    fontSize: 14,
  },
  emptyTasksMessage: {
    padding: 20,
    alignItems: "center",
  },
  emptyTasksText: {
    fontSize: 16,
    textAlign: "center",
  },
  settingItem: {
    marginBottom: 16,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  taskScrollView: {
    flex: 1,
  },
  completionMessage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  darkCompletionMessage: {
    backgroundColor: "rgba(30, 30, 30, 0.95)",
  },
  lightCompletionMessage: {
    backgroundColor: "rgba(240, 240, 240, 0.95)",
  },
  completionText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

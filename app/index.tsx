import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { useTasksData } from "../hooks/useTasksData";
import { useSettingsStore } from "../stores/settingsStore";
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
    state,
    setType,
    setDuration,
    setActiveTaskId,
    setSessionId,
    incrementCompletedSessions,
    resetCompletedSessions,
    start,
    reset: resetTimer,
  } = useTimerStore();

  // Task operations and global store
  const { fetchTasks, incrementPomodoro } = useTasksData();
  const { tasks } = useTaskStore();

  // Session operations
  const { startSession, completeSession } = useSessionsData();

  // Timer settings
  const [workMinutes, setWorkMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  // Get automatic behavior settings from Zustand store
  const { long_break_interval, auto_start_breaks, auto_start_pomodoros } =
    useSettingsStore();

  // Component state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showTaskSelect, setShowTaskSelect] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(
    null
  );
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

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
      // Load tasks (settings are now handled by Zustand store)
      await loadTasks();
    } catch (error) {
      // Error loading initial data - fail silently in production
    }
  };

  // Load tasks from the database
  const loadTasks = async () => {
    try {
      await fetchTasks(true);
    } catch (error) {
      // Error loading tasks - fail silently in production
    }
  };

  // Start timer session when timer starts
  const handleTimerStart = async () => {
    try {
      // Start a new session when timer begins
      const sessionId = await startSession(
        type,
        duration,
        activeTaskId || undefined
      );
      setCurrentSessionId(sessionId);
      setSessionStartTime(Date.now());
      start();
    } catch (error) {
      console.error("Error starting session:", error);
      // Still start the timer even if session tracking fails
      start();
    }
  };

  // Handle timer completion
  const handleTimerComplete = async () => {
    try {
      // Complete the current session if it exists
      if (currentSessionId && sessionStartTime) {
        const actualDuration = (Date.now() - sessionStartTime) / 1000; // Convert to seconds
        await completeSession(currentSessionId, actualDuration);
        setCurrentSessionId(null);
        setSessionStartTime(null);
      }

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

        // Determine next break type based on completed sessions
        // Use configurable long break interval instead of hardcoded 4
        const nextIsLongBreak =
          (completedSessions + 1) % long_break_interval === 0;
        const nextType = nextIsLongBreak ? "long_break" : "short_break";
        const nextDuration = nextIsLongBreak
          ? longBreakMinutes * 60
          : shortBreakMinutes * 60;

        // Switch to break
        const switchToBreak = () => {
          setType(nextType);
          setDuration(nextDuration);
          resetTimer();

          // Auto-start break if enabled
          if (auto_start_breaks) {
            setTimeout(() => {
              handleTimerStart();
            }, 1000); // Small delay to allow UI to update
          }
        };

        if (auto_start_breaks) {
          // Switch immediately if auto-start is enabled
          setTimeout(switchToBreak, 2000);
        } else {
          // Switch but don't start automatically
          setTimeout(() => {
            setType(nextType);
            setDuration(nextDuration);
            resetTimer();
          }, 2000);
        }

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
        // Show completion message
        setCompletionMessage("✨ Break time is over! Ready to focus?");

        // Switch back to work
        const switchToWork = () => {
          setType("work");
          setDuration(workMinutes * 60);
          resetTimer();

          // Auto-start work session if enabled
          if (auto_start_pomodoros) {
            setTimeout(() => {
              handleTimerStart();
            }, 1000); // Small delay to allow UI to update
          }
        };

        if (auto_start_pomodoros) {
          // Switch and auto-start if enabled
          setTimeout(switchToWork, 2000);
        } else {
          // Switch but don't start automatically
          setTimeout(() => {
            setType("work");
            setDuration(workMinutes * 60);
            resetTimer();
          }, 2000);
        }

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

  // Handle manual timer type switching
  const handleTimerTypeSwitch = (
    newType: "work" | "short_break" | "long_break"
  ) => {
    // Reset timer to idle state first
    resetTimer();

    // Set new type
    setType(newType);

    // Set appropriate duration based on type
    if (newType === "work") {
      setDuration(workMinutes * 60);
    } else if (newType === "short_break") {
      setDuration(shortBreakMinutes * 60);
    } else if (newType === "long_break") {
      setDuration(longBreakMinutes * 60);
    }
  };

  // Handle timer reset
  const handleTimerReset = () => {
    // Clean up current session tracking if in progress
    if (currentSessionId) {
      setCurrentSessionId(null);
      setSessionStartTime(null);
    }
    resetTimer();
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.timerContainer}>
        <Timer
          onComplete={handleTimerComplete}
          onStart={handleTimerStart}
          onReset={handleTimerReset}
        />

        {/* Manual Timer Type Switching */}
        <View style={styles.timerSwitchContainer}>
          <Text
            style={[
              styles.timerSwitchLabel,
              isDark ? styles.darkText : styles.lightText,
            ]}
          >
            Quick Switch:
          </Text>
          <View style={styles.timerSwitchButtons}>
            <TouchableOpacity
              style={[
                styles.timerSwitchButton,
                type === "work" && styles.timerSwitchButtonActive,
                isDark ? styles.darkButton : styles.lightButton,
              ]}
              onPress={() => handleTimerTypeSwitch("work")}
              disabled={state === "running"}
            >
              <MaterialIcons
                name="work"
                size={16}
                color={type === "work" ? "#fff" : isDark ? "#fff" : "#333"}
              />
              <Text
                style={[
                  styles.timerSwitchButtonText,
                  type === "work" && styles.timerSwitchButtonTextActive,
                  isDark ? styles.darkText : styles.lightText,
                ]}
              >
                Work
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.timerSwitchButton,
                type === "short_break" && styles.timerSwitchButtonActive,
                isDark ? styles.darkButton : styles.lightButton,
              ]}
              onPress={() => handleTimerTypeSwitch("short_break")}
              disabled={state === "running"}
            >
              <MaterialIcons
                name="coffee"
                size={16}
                color={
                  type === "short_break" ? "#fff" : isDark ? "#fff" : "#333"
                }
              />
              <Text
                style={[
                  styles.timerSwitchButtonText,
                  type === "short_break" && styles.timerSwitchButtonTextActive,
                  isDark ? styles.darkText : styles.lightText,
                ]}
              >
                Short
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.timerSwitchButton,
                type === "long_break" && styles.timerSwitchButtonActive,
                isDark ? styles.darkButton : styles.lightButton,
              ]}
              onPress={() => handleTimerTypeSwitch("long_break")}
              disabled={state === "running"}
            >
              <MaterialIcons
                name="free-breakfast"
                size={16}
                color={
                  type === "long_break" ? "#fff" : isDark ? "#fff" : "#333"
                }
              />
              <Text
                style={[
                  styles.timerSwitchButtonText,
                  type === "long_break" && styles.timerSwitchButtonTextActive,
                  isDark ? styles.darkText : styles.lightText,
                ]}
              >
                Long
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
            {((type === "work" && auto_start_breaks) ||
              (type !== "work" && auto_start_pomodoros)) &&
              " • Auto"}
          </Text>
          <View style={styles.sessionDots}>
            {Array.from({ length: long_break_interval }, (_, index) => (
              <View
                key={index + 1}
                style={[
                  styles.sessionDot,
                  completedSessions % long_break_interval >= index &&
                    styles.sessionDotActive,
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
              onSlidingComplete={(value) => setDuration(Math.round(value) * 60)}
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
              onSlidingComplete={(value) => setDuration(Math.round(value) * 60)}
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
              onSlidingComplete={(value) => setDuration(Math.round(value) * 60)}
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
  timerSwitchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timerSwitchLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
  timerSwitchButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerSwitchButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  timerSwitchButtonActive: {
    backgroundColor: "#625df5",
  },
  timerSwitchButtonText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  timerSwitchButtonTextActive: {
    color: "#fff",
  },
});

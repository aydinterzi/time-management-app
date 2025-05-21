import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Timer from "../components/Timer";
import { useSessionsData } from "../hooks/useSessionsData";
import { useSettingsData } from "../hooks/useSettingsData";
import { useTasksData } from "../hooks/useTasksData";
import { AppSettings } from "../stores/settingsStore";
import { Task } from "../stores/taskStore";
import { useTimerStore } from "../stores/timerStore";

export default function TimerScreen() {
  // Get color scheme
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Timer state
  const {
    type,
    duration,
    activeTaskId,
    setDuration,
    setActiveTaskId,
    incrementCompletedSessions,
    resetCompletedSessions,
  } = useTimerStore();

  // Task operations
  const { fetchTasks, incrementPomodoro } = useTasksData();

  // Session operations
  const { startSession, completeSession } = useSessionsData();

  // Settings operations
  const { getSettings } = useSettingsData();

  // Component state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showTaskSelect, setShowTaskSelect] = useState(false);

  // Load settings and tasks on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

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
      const result = await fetchTasks(false);
      setTasks(result as Task[]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  // Handle timer completion
  const handleTimerComplete = async () => {
    try {
      // Complete current session
      if (type === "work" && activeTaskId) {
        // Increment pomodoro count for the task
        await incrementPomodoro(activeTaskId);
        incrementCompletedSessions();
      }

      // TODO: Switch to next timer type (work -> break, break -> work)
      // This will be implemented in the next task
    } catch (error) {
      console.error("Error handling timer completion:", error);
    }
  };

  // Toggle task selection panel
  const toggleTaskSelect = () => {
    setShowTaskSelect(!showTaskSelect);
  };

  // Handle task selection for the timer
  const handleTaskSelect = (task: Task) => {
    setActiveTaskId(task.id);
    setShowTaskSelect(false);
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

        {/* Active Task Display */}
        <TouchableOpacity
          style={styles.activeTaskButton}
          onPress={toggleTaskSelect}
        >
          {activeTask ? (
            <View style={styles.activeTaskInfo}>
              <Text style={styles.activeTaskLabel}>Current Task:</Text>
              <Text style={styles.activeTaskTitle}>{activeTask.title}</Text>
            </View>
          ) : (
            <View style={styles.activeTaskInfo}>
              <Text style={styles.activeTaskLabel}>No Task Selected</Text>
              <Text style={styles.activeTaskTitle}>Tap to select a task</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Task Selection Panel */}
      {showTaskSelect && (
        <View style={styles.taskSelectPanel}>
          <View style={styles.taskSelectHeader}>
            <Text style={styles.taskSelectTitle}>Select a Task</Text>
            <TouchableOpacity onPress={toggleTaskSelect}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskSelectItem,
                  activeTaskId === task.id && styles.taskSelectItemActive,
                ]}
                onPress={() => handleTaskSelect(task)}
              >
                <Text style={styles.taskSelectItemTitle}>{task.title}</Text>
                <View style={styles.taskSelectItemMeta}>
                  <Text style={styles.taskSelectItemCount}>
                    {task.completed_pomodoros}/{task.estimated_pomodoros}{" "}
                    pomodoros
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyTasksMessage}>
              <Text style={styles.emptyTasksText}>
                No tasks available. Add tasks in the Tasks tab.
              </Text>
            </View>
          )}
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
  activeTaskButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#1e1e1e",
    width: "80%",
    alignItems: "center",
  },
  activeTaskInfo: {
    alignItems: "center",
  },
  activeTaskLabel: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 4,
  },
  activeTaskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  taskSelectPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "60%",
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
    color: "#fff",
  },
  taskSelectItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#2d2d2d",
    marginBottom: 8,
  },
  taskSelectItemActive: {
    backgroundColor: "#625df5",
  },
  taskSelectItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  taskSelectItemMeta: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  taskSelectItemCount: {
    fontSize: 14,
    color: "#aaa",
  },
  emptyTasksMessage: {
    padding: 20,
    alignItems: "center",
  },
  emptyTasksText: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
  },
});

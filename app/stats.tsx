import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionStat, useSessionsData } from "../hooks/useSessionsData";
import { useTasksData } from "../hooks/useTasksData";
import { Task } from "../stores/taskStore";

export default function StatsScreen() {
  // Force dark theme
  const isDark = true;

  // Use hooks for data access
  const sessionsData = useSessionsData();
  const { fetchTasks } = useTasksData();

  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [debugPressCount, setDebugPressCount] = useState(0);
  const [stats, setStats] = useState({
    totalWorkMinutes: 0,
    totalCompletedTasks: 0,
    totalSessions: 0,
    averageSessionsPerTask: 0,
  });

  // Simple loadData function without complex dependencies
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load completed tasks
      const tasksResult = await fetchTasks(true);
      const completedTasksResult = tasksResult.filter(
        (task: Task) => task.completed
      );
      setCompletedTasks(completedTasksResult);

      // Load session stats
      const sessionStatsResult = await sessionsData.getSessionStats();
      setSessionStats(sessionStatsResult);

      // Calculate statistics
      const totalWorkMinutes = sessionStatsResult.reduce(
        (total: number, stat: SessionStat) => {
          if (stat.type === "work") {
            return total + stat.total_duration / 60;
          }
          return total;
        },
        0
      );

      const totalSessions = sessionStatsResult.reduce(
        (total: number, stat: SessionStat) => total + stat.count,
        0
      );

      const workSessions = sessionStatsResult.find(
        (stat) => stat.type === "work"
      );
      const totalWorkSessions = workSessions ? workSessions.count : 0;

      const averageSessionsPerTask =
        completedTasksResult.length > 0
          ? totalWorkSessions / completedTasksResult.length
          : 0;

      setStats({
        totalWorkMinutes,
        totalCompletedTasks: completedTasksResult.length,
        totalSessions,
        averageSessionsPerTask,
      });
    } catch (error) {
      console.error("Error loading statistics data:", error);
      setError("Failed to load statistics data. Please try again.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [fetchTasks, sessionsData]); // Removed refreshing dependency

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []); // Only run on mount

  // Temporarily disabled focus effect to prevent blinking
  // Users can still manually refresh using pull-to-refresh
  // useFocusEffect(
  //   useCallback(() => {
  //     loadData();
  //   }, [loadData])
  // );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  // Debug function to create sample data
  const handleDebugPress = async () => {
    const newCount = debugPressCount + 1;
    setDebugPressCount(newCount);

    if (newCount >= 5) {
      try {
        setError(null);
        await sessionsData.createSampleSessions();
        setDebugPressCount(0);
        // Reload data to show the new sample sessions
        await loadData();
      } catch (error) {
        setError("Failed to create sample data");
      }
    }
  };

  // Show loading spinner on initial load
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={[
          styles.container,
          isDark ? styles.darkContainer : styles.lightContainer,
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#625df5" />
          <Text
            style={[
              styles.loadingText,
              isDark ? styles.darkSubText : styles.lightSubText,
            ]}
          >
            Loading statistics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#625df5"]}
            tintColor="#625df5"
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={24} color="#ff5252" />
            <Text
              style={[
                styles.errorText,
                isDark ? styles.darkText : styles.lightText,
              ]}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              isDark ? styles.darkStatCard : styles.lightStatCard,
            ]}
          >
            <MaterialIcons name="timer" size={32} color="#625df5" />
            <Text
              style={[
                styles.statValue,
                isDark ? styles.darkText : styles.lightText,
              ]}
            >
              {formatMinutes(stats.totalWorkMinutes)}
            </Text>
            <Text
              style={[
                styles.statLabel,
                isDark ? styles.darkSubText : styles.lightSubText,
              ]}
            >
              Total Work Time
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              isDark ? styles.darkStatCard : styles.lightStatCard,
            ]}
          >
            <MaterialIcons name="check-circle" size={32} color="#4caf50" />
            <Text
              style={[
                styles.statValue,
                isDark ? styles.darkText : styles.lightText,
              ]}
            >
              {stats.totalCompletedTasks}
            </Text>
            <Text
              style={[
                styles.statLabel,
                isDark ? styles.darkSubText : styles.lightSubText,
              ]}
            >
              Completed Tasks
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              isDark ? styles.darkStatCard : styles.lightStatCard,
            ]}
          >
            <MaterialIcons name="repeat" size={32} color="#ff9800" />
            <Text
              style={[
                styles.statValue,
                isDark ? styles.darkText : styles.lightText,
              ]}
            >
              {stats.totalSessions}
            </Text>
            <Text
              style={[
                styles.statLabel,
                isDark ? styles.darkSubText : styles.lightSubText,
              ]}
            >
              Total Sessions
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              isDark ? styles.darkStatCard : styles.lightStatCard,
            ]}
          >
            <MaterialIcons name="trending-up" size={32} color="#e91e63" />
            <Text
              style={[
                styles.statValue,
                isDark ? styles.darkText : styles.lightText,
              ]}
            >
              {stats.averageSessionsPerTask.toFixed(1)}
            </Text>
            <Text
              style={[
                styles.statLabel,
                isDark ? styles.darkSubText : styles.lightSubText,
              ]}
            >
              Work Sessions/Task
            </Text>
          </View>
        </View>

        {/* Session Breakdown */}
        {sessionStats.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity onPress={handleDebugPress}>
              <Text
                style={[
                  styles.sectionTitle,
                  isDark ? styles.darkText : styles.lightText,
                ]}
              >
                Session Breakdown (Last 7 Days){" "}
                {debugPressCount > 0 && `(${debugPressCount}/5)`}
              </Text>
            </TouchableOpacity>
            <View
              style={[
                styles.breakdownContainer,
                isDark ? styles.darkTaskList : styles.lightTaskList,
              ]}
            >
              {sessionStats.map((stat) => (
                <View key={stat.type} style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <MaterialIcons
                      name={
                        stat.type === "work"
                          ? "work"
                          : stat.type === "short_break"
                          ? "coffee"
                          : "local-cafe"
                      }
                      size={24}
                      color={
                        stat.type === "work"
                          ? "#625df5"
                          : stat.type === "short_break"
                          ? "#4caf50"
                          : "#ff9800"
                      }
                    />
                    <Text
                      style={[
                        styles.breakdownType,
                        isDark ? styles.darkText : styles.lightText,
                      ]}
                    >
                      {stat.type
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Text>
                  </View>
                  <View style={styles.breakdownRight}>
                    <Text
                      style={[
                        styles.breakdownCount,
                        isDark ? styles.darkText : styles.lightText,
                      ]}
                    >
                      {stat.count} sessions
                    </Text>
                    <Text
                      style={[
                        styles.breakdownDuration,
                        isDark ? styles.darkSubText : styles.lightSubText,
                      ]}
                    >
                      {formatMinutes(stat.total_duration / 60)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Completed Tasks Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDark ? styles.darkText : styles.lightText,
            ]}
          >
            Recently Completed Tasks
          </Text>
          <View
            style={[
              styles.taskListContainer,
              isDark ? styles.darkTaskList : styles.lightTaskList,
            ]}
          >
            {completedTasks.length > 0 ? (
              completedTasks.slice(0, 10).map((task) => (
                <View key={task.id} style={styles.taskItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#4caf50"
                  />
                  <View style={styles.taskDetails}>
                    <Text
                      style={[
                        styles.taskTitle,
                        isDark ? styles.darkText : styles.lightText,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <Text
                      style={[
                        styles.taskSubtitle,
                        isDark ? styles.darkSubText : styles.lightSubText,
                      ]}
                    >
                      {task.completed_pomodoros} pomodoros completed
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text
                style={[
                  styles.emptyText,
                  isDark ? styles.darkSubText : styles.lightSubText,
                ]}
              >
                No completed tasks yet. Start a timer session to track your
                progress!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  darkStatCard: {
    backgroundColor: "#1e1e1e",
  },
  lightStatCard: {
    backgroundColor: "#e0e0e0",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  breakdownContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownType: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  breakdownRight: {
    alignItems: "flex-end",
  },
  breakdownCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  breakdownDuration: {
    fontSize: 12,
    marginTop: 2,
  },
  taskListContainer: {
    borderRadius: 8,
    padding: 8,
  },
  darkTaskList: {
    backgroundColor: "#1e1e1e",
  },
  lightTaskList: {
    backgroundColor: "#e0e0e0",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  taskDetails: {
    marginLeft: 12,
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    fontStyle: "italic",
  },
});

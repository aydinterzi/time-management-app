import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSessionsData } from "../hooks/useSessionsData";
import { useTasksData } from "../hooks/useTasksData";
import { Task } from "../stores/taskStore";

// Define SessionStat type for the return value of getSessionStats
interface SessionStat {
  type: string;
  count: number;
  total_duration: number;
}

export default function StatsScreen() {
  // Force dark theme
  const isDark = true;

  // Use hooks for data access
  const sessionsData = useSessionsData();
  const { fetchTasks } = useTasksData();

  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkMinutes: 0,
    totalCompletedTasks: 0,
    totalSessions: 0,
    averageSessionsPerTask: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
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

      const averageSessionsPerTask = completedTasksResult.length
        ? totalSessions / completedTasksResult.length
        : 0;

      setStats({
        totalWorkMinutes,
        totalCompletedTasks: completedTasksResult.length,
        totalSessions,
        averageSessionsPerTask,
      });
    } catch (error) {
      console.error("Error loading statistics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <ScrollView style={styles.scrollContainer}>
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
              {stats.totalWorkMinutes.toFixed(0)}
            </Text>
            <Text
              style={[
                styles.statLabel,
                isDark ? styles.darkSubText : styles.lightSubText,
              ]}
            >
              Total Minutes
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
              Avg Sessions/Task
            </Text>
          </View>
        </View>

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
              completedTasks.map((task) => (
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
                      {task.completed_pomodoros} pomodoros
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
                No completed tasks yet
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
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
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
  },
});

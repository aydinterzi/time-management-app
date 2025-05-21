import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSessionsData } from "../hooks/useSessionsData";
import { useTasksData } from "../hooks/useTasksData";
import { Session } from "../stores/sessionStore";
import { Task } from "../stores/taskStore";

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { fetchSessions } = useSessionsData();
  const { fetchTasks } = useTasksData();

  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
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

      // Load sessions
      const sessionsResult = await fetchSessions();
      setSessions(sessionsResult);

      // Calculate statistics
      const totalWorkMinutes = sessionsResult.reduce(
        (total: number, session: Session) => {
          return total + session.duration / 60;
        },
        0
      );

      const averageSessionsPerTask = completedTasksResult.length
        ? sessionsResult.length / completedTasksResult.length
        : 0;

      setStats({
        totalWorkMinutes,
        totalCompletedTasks: completedTasksResult.length,
        totalSessions: sessionsResult.length,
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
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <ScrollView style={styles.scrollContainer}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="timer" size={32} color="#625df5" />
            <Text style={styles.statValue}>
              {stats.totalWorkMinutes.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total Minutes</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={32} color="#4caf50" />
            <Text style={styles.statValue}>{stats.totalCompletedTasks}</Text>
            <Text style={styles.statLabel}>Completed Tasks</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="repeat" size={32} color="#ff9800" />
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="trending-up" size={32} color="#e91e63" />
            <Text style={styles.statValue}>
              {stats.averageSessionsPerTask.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Avg Sessions/Task</Text>
          </View>
        </View>

        {/* Completed Tasks Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Completed Tasks</Text>
          <View style={styles.taskListContainer}>
            {completedTasks.length > 0 ? (
              completedTasks.map((task) => (
                <View key={task.id} style={styles.taskItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#4caf50"
                  />
                  <View style={styles.taskDetails}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskSubtitle}>
                      {task.completed_pomodoros} pomodoros
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No completed tasks yet</Text>
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
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#aaa",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  taskListContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 8,
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
    color: "#fff",
  },
  taskSubtitle: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    padding: 16,
  },
});

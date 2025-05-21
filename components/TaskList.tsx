import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTasksData } from "../hooks/useTasksData";
import { Task } from "../stores/taskStore";
import TaskItem from "./TaskItem";

interface TaskListProps {
  onTaskPress: (task: Task) => void;
  onAddPress: () => void;
  activeTaskId?: number | null;
  showCompleted?: boolean;
}

export default function TaskList({
  onTaskPress,
  onAddPress,
  activeTaskId,
  showCompleted = false,
}: TaskListProps) {
  const { fetchTasks, completeTask, deleteTask } = useTasksData();

  // Component state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletedTasks, setShowCompletedTasks] = useState(showCompleted);

  // Load tasks from database
  useEffect(() => {
    loadTasks();
  }, [showCompletedTasks]);

  // Load tasks from the database
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const result = await fetchTasks(showCompletedTasks);
      setTasks(result as Task[]);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task completion
  const handleCompleteTask = async (taskId: number) => {
    try {
      await completeTask(taskId);
      // Refresh task list
      loadTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      // Refresh task list
      loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Toggle completed tasks visibility
  const toggleCompletedTasks = () => {
    setShowCompletedTasks(!showCompletedTasks);
  };

  // Render empty state message
  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#625df5" />
          <Text style={styles.emptyText}>Loading tasks...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="assignment" size={64} color="#555" />
        <Text style={styles.emptyText}>No tasks found</Text>
        <Text style={styles.emptySubtext}>
          Add a new task to get started with your Pomodoro timer
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={toggleCompletedTasks}
          >
            <Text style={styles.filterButtonText}>
              {showCompletedTasks ? "Hide Completed" : "Show Completed"}
            </Text>
            <MaterialIcons
              name={showCompletedTasks ? "visibility-off" : "visibility"}
              size={18}
              color="#aaa"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addIconButton} onPress={onAddPress}>
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onPress={onTaskPress}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
            isActive={activeTaskId === item.id}
          />
        )}
        contentContainerStyle={
          tasks.length === 0 ? { flex: 1 } : styles.listContent
        }
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#625df5",
    justifyContent: "center",
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#2d2d2d",
    marginRight: 10,
  },
  filterButtonText: {
    color: "#aaa",
    fontSize: 14,
    marginRight: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#aaa",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#625df5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
});

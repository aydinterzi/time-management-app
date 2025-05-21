import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Task } from "../stores/taskStore";

interface TaskItemProps {
  task: Task;
  onPress: (task: Task) => void;
  onComplete: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  isActive?: boolean;
}

export default function TaskItem({
  task,
  onPress,
  onComplete,
  onDelete,
  isActive = false,
}: TaskItemProps) {
  // Priority colors
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3:
        return "#ff5252"; // High - Red
      case 2:
        return "#ffab40"; // Medium - Orange
      case 1:
      default:
        return "#4caf50"; // Low - Green
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  // Priority label
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3:
        return "High";
      case 2:
        return "Medium";
      case 1:
      default:
        return "Low";
    }
  };

  return (
    <Pressable
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={() => onPress(task)}
    >
      {/* Priority indicator */}
      <View
        style={[
          styles.priorityIndicator,
          { backgroundColor: getPriorityColor(task.priority) },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, task.completed && styles.completedText]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
        </View>

        {/* Task details */}
        <View style={styles.detailsRow}>
          <Text style={styles.priorityText}>
            {getPriorityLabel(task.priority)}
          </Text>

          <View style={styles.pomodoroIndicator}>
            <MaterialIcons name="timer" size={16} color="#888" />
            <Text style={styles.pomodoroText}>
              {task.completed_pomodoros}/{task.estimated_pomodoros}
            </Text>
          </View>

          {task.completed && (
            <Text style={styles.dateText}>
              Completed: {formatDate(task.completed_at || 0)}
            </Text>
          )}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {!task.completed ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onComplete(task.id)}
          >
            <MaterialIcons
              name="check-circle-outline"
              size={24}
              color="#4caf50"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.completedIcon}>
            <MaterialIcons name="check-circle" size={24} color="#4caf50" />
          </View>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(task.id)}
        >
          <MaterialIcons name="delete-outline" size={24} color="#ff5252" />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#2d2d2d",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  activeContainer: {
    backgroundColor: "#3a3a3a",
    borderWidth: 1,
    borderColor: "#625df5",
  },
  priorityIndicator: {
    width: 4,
    height: "80%",
    borderRadius: 4,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityText: {
    fontSize: 12,
    color: "#bbb",
    marginRight: 12,
  },
  pomodoroIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  pomodoroText: {
    fontSize: 12,
    color: "#bbb",
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#bbb",
    marginLeft: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 4,
    marginLeft: 6,
  },
  completedIcon: {
    padding: 4,
    marginLeft: 6,
  },
});

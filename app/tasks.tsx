import React, { useState } from "react";
import { Modal, SafeAreaView, StyleSheet, View } from "react-native";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import { useTasksData } from "../hooks/useTasksData";
import { Task } from "../stores/taskStore";

export default function TasksScreen() {
  // Force dark theme
  const isDark = true;

  // Task operations
  const { createTask, updateTask, fetchTasks } = useTasksData();

  // Component state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Show form to add a new task
  const handleAddTask = () => {
    setCurrentTask(null);
    setIsEditing(false);
    setShowTaskForm(true);
  };

  // Show form to edit an existing task
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditing(true);
    setShowTaskForm(true);
  };

  // Handle form submission for adding/editing a task
  const handleSubmitTask = async (taskData: Partial<Task>) => {
    try {
      if (isEditing && currentTask) {
        // Update existing task
        await updateTask(currentTask.id, {
          title: taskData.title || currentTask.title,
          description: taskData.description,
          priority: taskData.priority,
          estimated_pomodoros: taskData.estimated_pomodoros,
        });
      } else if (taskData.title) {
        // Create new task (ensure title is provided)
        await createTask({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          estimated_pomodoros: taskData.estimated_pomodoros,
        });
      }

      setShowTaskForm(false);
      // No need to call fetchTasks() here as the hook already updates the global store
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <View style={styles.taskListContainer}>
        <TaskList
          onTaskPress={handleEditTask}
          onAddPress={handleAddTask}
          showCompleted={true}
        />
      </View>

      {/* Modal for task form */}
      <Modal
        visible={showTaskForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTaskForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TaskForm
              onSubmit={handleSubmitTask}
              onCancel={() => setShowTaskForm(false)}
              initialValues={currentTask || undefined}
              isEditing={isEditing}
            />
          </View>
        </View>
      </Modal>
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
  taskListContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    marginTop: 80,
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
});

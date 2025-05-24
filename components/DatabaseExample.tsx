import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NewTask } from "../db/schema";
import { taskService } from "../db/services";

export default function DatabaseExample() {
  const [tasks, setTasks] = useState<any[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allTasks = await taskService.getAll();
      setTasks(allTasks);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const addSampleTask = async () => {
    try {
      const newTask: NewTask = {
        title: `Sample Task ${Date.now()}`,
        description: "This is a sample task created with Drizzle",
        priority: "medium",
        completed: false,
      };

      await taskService.create(newTask);
      await loadData(); // Refresh data
      Alert.alert("Success", "Sample task added!");
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Error", "Failed to add task");
    }
  };

  const clearAllData = async () => {
    try {
      // Delete all tasks
      for (const task of tasks) {
        await taskService.delete(task.id);
      }

      await loadData(); // Refresh data
      Alert.alert("Success", "All data cleared!");
    } catch (error) {
      console.error("Error clearing data:", error);
      Alert.alert("Error", "Failed to clear data");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Example</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks ({tasks.length})</Text>
        {tasks.map((task, index) => (
          <Text key={task.id} style={styles.item}>
            {index + 1}. {task.title} - {task.priority} -{" "}
            {task.completed ? "✓" : "○"}
          </Text>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={addSampleTask}>
          <Text style={styles.buttonText}>Add Sample Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearAllData}
        >
          <Text style={styles.buttonText}>Clear All Tasks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#625df5",
    marginBottom: 10,
  },
  item: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 5,
    paddingLeft: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: "#625df5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  dangerButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

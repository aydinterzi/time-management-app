import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NewHabit, NewTask } from "../db/schema";
import { habitService, taskService } from "../db/services";

export default function DatabaseExample() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allTasks = await taskService.getAll();
      const allHabits = await habitService.getAll();
      setTasks(allTasks);
      setHabits(allHabits);
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

  const addSampleHabit = async () => {
    try {
      const newHabit: NewHabit = {
        name: `Sample Habit ${Date.now()}`,
        description: "This is a sample habit created with Drizzle",
      };

      await habitService.create(newHabit);
      await loadData(); // Refresh data
      Alert.alert("Success", "Sample habit added!");
    } catch (error) {
      console.error("Error adding habit:", error);
      Alert.alert("Error", "Failed to add habit");
    }
  };

  const clearAllData = async () => {
    try {
      // Delete all tasks
      for (const task of tasks) {
        await taskService.delete(task.id);
      }

      // Delete all habits
      for (const habit of habits) {
        await habitService.delete(habit.id);
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
            {index + 1}. {task.title} - {task.priority}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habits ({habits.length})</Text>
        {habits.map((habit, index) => (
          <Text key={habit.id} style={styles.item}>
            {index + 1}. {habit.name}
          </Text>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={addSampleTask}>
          <Text style={styles.buttonText}>Add Sample Task</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={addSampleHabit}>
          <Text style={styles.buttonText}>Add Sample Habit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearAllData}
        >
          <Text style={styles.buttonText}>Clear All Data</Text>
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

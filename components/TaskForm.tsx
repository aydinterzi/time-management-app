import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Task } from "../stores/taskStore";

interface TaskFormProps {
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
  initialValues?: Partial<Task>;
  isEditing?: boolean;
}

export default function TaskForm({
  onSubmit,
  onCancel,
  initialValues,
  isEditing = false,
}: TaskFormProps) {
  // Form state
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [priority, setPriority] = useState(initialValues?.priority || 1);
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(
    initialValues?.estimated_pomodoros || 1
  );

  // Form validation
  const [titleError, setTitleError] = useState("");
  const isValid = title.trim().length > 0;

  // Priority options
  const priorities = [
    { value: 1, label: "Low" },
    { value: 2, label: "Medium" },
    { value: 3, label: "High" },
  ];

  // Handle title change with validation
  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (text.trim().length === 0) {
      setTitleError("Title is required");
    } else {
      setTitleError("");
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isValid) {
      setTitleError("Title is required");
      return;
    }

    onSubmit({
      ...(initialValues?.id ? { id: initialValues.id } : {}),
      title,
      description,
      priority,
      estimated_pomodoros: estimatedPomodoros,
    });
  };

  // Adjust estimated pomodoros
  const decrementPomodoros = () => {
    if (estimatedPomodoros > 1) {
      setEstimatedPomodoros(estimatedPomodoros - 1);
    }
  };

  const incrementPomodoros = () => {
    if (estimatedPomodoros < 10) {
      setEstimatedPomodoros(estimatedPomodoros + 1);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{isEditing ? "Edit Task" : "New Task"}</Text>

        {/* Task title input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.input, titleError ? styles.inputError : null]}
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Enter task title"
            placeholderTextColor="#888"
            autoFocus
          />
          {titleError ? (
            <Text style={styles.errorText}>{titleError}</Text>
          ) : null}
        </View>

        {/* Task description input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description (optional)"
            placeholderTextColor="#888"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Priority selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.priorityButton,
                  priority === item.value && styles.selectedPriority,
                  priority === item.value && {
                    backgroundColor:
                      item.value === 3
                        ? "#ff525240"
                        : item.value === 2
                        ? "#ffab4040"
                        : "#4caf5040",
                  },
                ]}
                onPress={() => setPriority(item.value)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === item.value && styles.selectedPriorityText,
                    {
                      color:
                        item.value === 3
                          ? "#ff5252"
                          : item.value === 2
                          ? "#ffab40"
                          : "#4caf50",
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estimated pomodoros */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Estimated Pomodoros</Text>
          <View style={styles.pomodoroSelector}>
            <TouchableOpacity
              style={styles.pomodoroButton}
              onPress={decrementPomodoros}
              disabled={estimatedPomodoros <= 1}
            >
              <MaterialIcons
                name="remove"
                size={24}
                color={estimatedPomodoros <= 1 ? "#555" : "#fff"}
              />
            </TouchableOpacity>
            <Text style={styles.pomodoroCount}>{estimatedPomodoros}</Text>
            <TouchableOpacity
              style={styles.pomodoroButton}
              onPress={incrementPomodoros}
              disabled={estimatedPomodoros >= 10}
            >
              <MaterialIcons
                name="add"
                size={24}
                color={estimatedPomodoros >= 10 ? "#555" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, !isValid && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!isValid}
          >
            <Text style={styles.submitButtonText}>
              {isEditing ? "Update Task" : "Add Task"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2d2d2d",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#ff5252",
  },
  errorText: {
    color: "#ff5252",
    marginTop: 4,
    fontSize: 12,
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: "#2d2d2d",
    alignItems: "center",
  },
  selectedPriority: {
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedPriorityText: {
    fontWeight: "bold",
  },
  pomodoroSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2d2d2d",
    borderRadius: 8,
    justifyContent: "space-between",
    padding: 8,
  },
  pomodoroButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#3d3d3d",
  },
  pomodoroCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: "#625df5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 2,
    marginLeft: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#3d3d3d",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#625df580",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButtonText: {
    color: "#ddd",
    fontSize: 16,
  },
});

import { useCallback } from "react";
import { Task, useTaskStore } from "../stores/taskStore";

// In-memory implementation that replaces database operations
const mockTasks: Task[] = [];
let nextTaskId = 1;

export function useTasksData() {
  const {
    setTasks,
    addTask,
    updateTask,
    removeTask,
    markTaskCompleted,
    incrementTaskPomodoro,
    setLoading,
  } = useTaskStore();

  // Fetch tasks from memory
  const fetchTasks = useCallback(
    async (includeCompleted = false) => {
      try {
        setLoading(true);
        const filteredTasks = includeCompleted
          ? mockTasks
          : mockTasks.filter((task) => !task.completed);
        setTasks([...filteredTasks]);
        return filteredTasks;
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [setTasks, setLoading]
  );

  // Create a new task
  const createTask = useCallback(
    async (taskData: {
      title: string;
      description?: string;
      priority?: number;
      estimated_pomodoros?: number;
    }) => {
      try {
        setLoading(true);
        const newTask: Task = {
          id: nextTaskId++,
          title: taskData.title,
          description: taskData.description || "",
          priority: taskData.priority || 1,
          estimated_pomodoros: taskData.estimated_pomodoros || 1,
          completed_pomodoros: 0,
          completed: false,
          created_at: Math.floor(Date.now() / 1000),
          completed_at: undefined,
        };

        mockTasks.push(newTask);
        addTask(newTask);
        return newTask;
      } catch (error) {
        console.error("Error creating task:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [addTask, setLoading]
  );

  // Update an existing task
  const updateTaskData = useCallback(
    async (
      taskId: number,
      updates: Partial<{
        title: string;
        description: string;
        priority: number;
        estimated_pomodoros: number;
        completed_pomodoros: number;
        completed: boolean;
        completed_at: number;
      }>
    ) => {
      try {
        setLoading(true);
        const taskIndex = mockTasks.findIndex((task) => task.id === taskId);

        if (taskIndex !== -1) {
          const updatedTask = { ...mockTasks[taskIndex], ...updates };
          mockTasks[taskIndex] = updatedTask;
          updateTask(updatedTask);
          return updatedTask;
        }

        return null;
      } catch (error) {
        console.error("Error updating task:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [updateTask, setLoading]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId: number) => {
      try {
        setLoading(true);
        const taskIndex = mockTasks.findIndex((task) => task.id === taskId);

        if (taskIndex !== -1) {
          mockTasks.splice(taskIndex, 1);
          removeTask(taskId);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error deleting task:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [removeTask, setLoading]
  );

  // Mark a task as completed
  const completeTask = useCallback(
    async (taskId: number) => {
      try {
        setLoading(true);
        const taskIndex = mockTasks.findIndex((task) => task.id === taskId);

        if (taskIndex !== -1) {
          mockTasks[taskIndex].completed = true;
          mockTasks[taskIndex].completed_at = Math.floor(Date.now() / 1000);
          markTaskCompleted(taskId);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error completing task:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [markTaskCompleted, setLoading]
  );

  // Increment completed pomodoros for a task
  const incrementPomodoro = useCallback(
    async (taskId: number) => {
      try {
        setLoading(true);
        const taskIndex = mockTasks.findIndex((task) => task.id === taskId);

        if (taskIndex !== -1) {
          mockTasks[taskIndex].completed_pomodoros += 1;
          incrementTaskPomodoro(taskId);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error incrementing pomodoro:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [incrementTaskPomodoro, setLoading]
  );

  return {
    fetchTasks,
    createTask,
    updateTask: updateTaskData,
    deleteTask,
    completeTask,
    incrementPomodoro,
  };
}

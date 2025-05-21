import { useCallback } from "react";
import { useTaskOperations } from "../contexts/DatabaseContext";
import { Task, useTaskStore } from "../stores/taskStore";

export function useTasksData() {
  const taskOperations = useTaskOperations();
  const {
    setTasks,
    addTask,
    updateTask,
    removeTask,
    markTaskCompleted,
    incrementTaskPomodoro,
    setLoading,
  } = useTaskStore();

  // Fetch tasks from the database
  const fetchTasks = useCallback(
    async (includeCompleted = false) => {
      try {
        setLoading(true);
        const tasks = await taskOperations.getTasks(includeCompleted);
        setTasks(tasks as Task[]);
        return tasks;
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [taskOperations, setTasks, setLoading]
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
        const newTaskId = await taskOperations.createTask(taskData);

        if (newTaskId) {
          // Fetch the newly created task to get all fields
          const newTask = await taskOperations.getTaskById(newTaskId as number);
          if (newTask) {
            addTask(newTask as Task);
            return newTask;
          }
        }
        return null;
      } catch (error) {
        console.error("Error creating task:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [taskOperations, addTask, setLoading]
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
        const success = await taskOperations.updateTask(taskId, updates);

        if (success) {
          // Fetch the updated task to get all fields
          const updatedTask = await taskOperations.getTaskById(taskId);
          if (updatedTask) {
            updateTask(updatedTask as Task);
            return updatedTask;
          }
        }
        return null;
      } catch (error) {
        console.error("Error updating task:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [taskOperations, updateTask, setLoading]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId: number) => {
      try {
        setLoading(true);
        const success = await taskOperations.deleteTask(taskId);

        if (success) {
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
    [taskOperations, removeTask, setLoading]
  );

  // Mark a task as completed
  const completeTask = useCallback(
    async (taskId: number) => {
      try {
        setLoading(true);
        const success = await taskOperations.completeTask(taskId);

        if (success) {
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
    [taskOperations, markTaskCompleted, setLoading]
  );

  // Increment completed pomodoros for a task
  const incrementPomodoro = useCallback(
    async (taskId: number) => {
      try {
        setLoading(true);
        const success = await taskOperations.incrementPomodoro(taskId);

        if (success) {
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
    [taskOperations, incrementTaskPomodoro, setLoading]
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

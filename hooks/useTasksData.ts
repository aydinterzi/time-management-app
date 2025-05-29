import { useCallback } from "react";
import { NewTask } from "../db/schema";
import { taskService } from "../db/services";
import { Task, useTaskStore } from "../stores/taskStore";

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

  // Convert database task to app task format
  const convertDbTaskToAppTask = (dbTask: any): Task => ({
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || "",
    priority:
      dbTask.priority === "high" ? 3 : dbTask.priority === "medium" ? 2 : 1,
    estimated_pomodoros: dbTask.estimated_pomodoros || 1,
    completed_pomodoros: dbTask.completed_pomodoros || 0,
    completed: dbTask.completed,
    created_at: new Date(dbTask.created_at).getTime() / 1000,
    completed_at: undefined, // Not tracked in current DB schema
  });

  // Convert app task to database task format
  const convertAppTaskToDbTask = (
    appTask: Partial<Task>
  ): Partial<NewTask> => ({
    title: appTask.title,
    description: appTask.description,
    priority:
      appTask.priority === 3
        ? "high"
        : appTask.priority === 2
        ? "medium"
        : "low",
    completed: appTask.completed,
    estimated_pomodoros: appTask.estimated_pomodoros,
    completed_pomodoros: appTask.completed_pomodoros,
    due_date: undefined, // Not used in current app
    category: undefined, // Not used in current app
  });

  // Fetch tasks from database
  const fetchTasks = useCallback(
    async (includeCompleted = false) => {
      try {
        setLoading(true);
        let dbTasks;

        if (includeCompleted) {
          dbTasks = await taskService.getAll();
        } else {
          dbTasks = await taskService.getByStatus(false);
        }

        const appTasks = dbTasks.map(convertDbTaskToAppTask);
        setTasks(appTasks);
        return appTasks;
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

        const dbTaskData = convertAppTaskToDbTask({
          title: taskData.title,
          description: taskData.description || "",
          priority: taskData.priority || 1,
          estimated_pomodoros: taskData.estimated_pomodoros || 1,
          completed: false,
        });

        const result = await taskService.create(dbTaskData as NewTask);

        // Get the created task from the result
        const createdDbTask = result[0]; // returning() returns an array

        const appTask = convertDbTaskToAppTask(createdDbTask);
        addTask(appTask);
        return appTask;
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

        const dbUpdates = convertAppTaskToDbTask(updates);
        await taskService.update(taskId, dbUpdates);

        // Fetch the updated task
        const updatedDbTasks = await taskService.getAll();
        const updatedDbTask = updatedDbTasks.find((task) => task.id === taskId);

        if (updatedDbTask) {
          const updatedAppTask = convertDbTaskToAppTask(updatedDbTask);
          updateTask(updatedAppTask);
          return updatedAppTask;
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
        await taskService.delete(taskId);
        removeTask(taskId);
        return true;
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
        await taskService.update(taskId, { completed: true });
        markTaskCompleted(taskId);
        return true;
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

        // Get current task to increment its pomodoro count
        const currentTasks = await taskService.getAll();
        const currentTask = currentTasks.find((task) => task.id === taskId);

        if (currentTask) {
          const newCompletedPomodoros =
            (currentTask.completed_pomodoros || 0) + 1;

          // Update in database
          await taskService.update(taskId, {
            completed_pomodoros: newCompletedPomodoros,
          });

          // Update in store
          incrementTaskPomodoro(taskId);
        }

        return true;
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

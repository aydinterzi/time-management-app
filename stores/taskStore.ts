import { create } from "zustand";

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: number;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  completed: boolean;
  created_at: number;
  completed_at?: number;
}

interface TaskStore {
  // Task state
  tasks: Task[];
  isLoading: boolean;
  currentTask: Task | null;

  // Task actions
  setTasks: (tasks: Task[]) => void;
  setCurrentTask: (task: Task | null) => void;
  addTask: (task: Task) => void;
  updateTask: (updatedTask: Task) => void;
  removeTask: (taskId: number) => void;
  markTaskCompleted: (taskId: number) => void;
  incrementTaskPomodoro: (taskId: number) => void;

  // Loading state
  setLoading: (isLoading: boolean) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial task state
  tasks: [],
  isLoading: false,
  currentTask: null,

  // Task state setters
  setTasks: (tasks) => set({ tasks }),
  setCurrentTask: (task) => set({ currentTask: task }),
  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),
  updateTask: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      ),
      currentTask:
        state.currentTask?.id === updatedTask.id
          ? updatedTask
          : state.currentTask,
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
    })),
  markTaskCompleted: (taskId) =>
    set((state) => {
      const now = Math.floor(Date.now() / 1000);
      return {
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, completed: true, completed_at: now }
            : task
        ),
        currentTask:
          state.currentTask?.id === taskId
            ? { ...state.currentTask, completed: true, completed_at: now }
            : state.currentTask,
      };
    }),
  incrementTaskPomodoro: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, completed_pomodoros: task.completed_pomodoros + 1 }
          : task
      ),
      currentTask:
        state.currentTask?.id === taskId
          ? {
              ...state.currentTask,
              completed_pomodoros: state.currentTask.completed_pomodoros + 1,
            }
          : state.currentTask,
    })),

  // Loading state
  setLoading: (isLoading) => set({ isLoading }),
}));

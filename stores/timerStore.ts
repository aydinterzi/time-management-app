import { create } from "zustand";

export type TimerState = "idle" | "running" | "paused" | "completed";
export type TimerType = "work" | "short_break" | "long_break";

interface Timer {
  // Timer state
  state: TimerState;
  type: TimerType;
  duration: number;
  timeRemaining: number;
  sessionId: number | null;
  activeTaskId: number | null;
  completedSessions: number;

  // Timer actions
  setType: (type: TimerType) => void;
  setDuration: (duration: number) => void;
  setTimeRemaining: (timeRemaining: number) => void;
  setSessionId: (sessionId: number | null) => void;
  setActiveTaskId: (taskId: number | null) => void;

  // Timer control functions
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  complete: () => void;

  // Pomodoro cycle functions
  incrementCompletedSessions: () => void;
  resetCompletedSessions: () => void;
}

export const useTimerStore = create<Timer>((set) => ({
  // Initial timer state
  state: "idle",
  type: "work",
  duration: 25 * 60, // 25 minutes in seconds
  timeRemaining: 25 * 60,
  sessionId: null,
  activeTaskId: null,
  completedSessions: 0,

  // Timer state setters
  setType: (type) => set({ type }),
  setDuration: (duration) => set({ duration, timeRemaining: duration }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setSessionId: (sessionId) => set({ sessionId }),
  setActiveTaskId: (taskId) => set({ activeTaskId: taskId }),

  // Timer control functions
  start: () => set({ state: "running" }),
  pause: () => set({ state: "paused" }),
  resume: () => set({ state: "running" }),
  reset: () =>
    set((state) => ({
      state: "idle",
      timeRemaining: state.duration,
    })),
  complete: () => set({ state: "completed" }),

  // Pomodoro cycle functions
  incrementCompletedSessions: () =>
    set((state) => ({ completedSessions: state.completedSessions + 1 })),
  resetCompletedSessions: () => set({ completedSessions: 0 }),
}));

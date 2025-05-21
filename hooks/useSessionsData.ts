import { useCallback } from "react";

// Types
export interface Session {
  id: number;
  task_id: number | null;
  start_time: number;
  end_time?: number;
  duration: number;
  type: "work" | "short_break" | "long_break";
  completed: boolean;
}

// In-memory implementation that replaces database operations
const mockSessions: Session[] = [];
let nextSessionId = 1;

export function useSessionsData() {
  // Start a new session
  const startSession = useCallback(
    async (
      taskId: number | null,
      type: "work" | "short_break" | "long_break",
      duration: number
    ) => {
      try {
        const newSession: Session = {
          id: nextSessionId++,
          task_id: taskId,
          start_time: Math.floor(Date.now() / 1000),
          duration,
          type,
          completed: false,
        };

        mockSessions.push(newSession);
        return newSession.id;
      } catch (error) {
        console.error("Error starting session:", error);
        return null;
      }
    },
    []
  );

  // Complete a session
  const completeSession = useCallback(async (sessionId: number) => {
    try {
      const sessionIndex = mockSessions.findIndex(
        (session) => session.id === sessionId
      );

      if (sessionIndex !== -1) {
        mockSessions[sessionIndex].completed = true;
        mockSessions[sessionIndex].end_time = Math.floor(Date.now() / 1000);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error completing session:", error);
      return false;
    }
  }, []);

  // Get session statistics
  const getSessionStats = useCallback(async (days = 7) => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const cutoffTime = now - days * 86400;

      const stats = mockSessions
        .filter((s) => s.completed && (s.end_time || 0) > cutoffTime)
        .reduce((acc, session) => {
          const type = session.type;
          if (!acc[type]) {
            acc[type] = { count: 0, total_duration: 0 };
          }
          acc[type].count += 1;
          acc[type].total_duration += session.duration;
          return acc;
        }, {} as Record<string, { count: number; total_duration: number }>);

      return Object.entries(stats).map(([type, data]) => ({
        type,
        count: data.count,
        total_duration: data.total_duration,
      }));
    } catch (error) {
      console.error("Error getting session stats:", error);
      return [];
    }
  }, []);

  // Get all sessions for a specific task
  const getTaskSessions = useCallback(async (taskId: number) => {
    try {
      return mockSessions
        .filter((session) => session.task_id === taskId)
        .sort((a, b) => b.start_time - a.start_time);
    } catch (error) {
      console.error("Error getting task sessions:", error);
      return [];
    }
  }, []);

  return {
    startSession,
    completeSession,
    getSessionStats,
    getTaskSessions,
  };
}

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
        console.log(
          `Starting session: ${type}, duration: ${duration}s, taskId: ${taskId}`
        );

        const newSession: Session = {
          id: nextSessionId++,
          task_id: taskId,
          start_time: Math.floor(Date.now() / 1000),
          duration,
          type,
          completed: false,
        };

        mockSessions.push(newSession);
        console.log(`Session started with ID: ${newSession.id}`);
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
      console.log(`Completing session with ID: ${sessionId}`);

      const sessionIndex = mockSessions.findIndex(
        (session) => session.id === sessionId
      );

      if (sessionIndex !== -1) {
        mockSessions[sessionIndex].completed = true;
        mockSessions[sessionIndex].end_time = Math.floor(Date.now() / 1000);
        console.log(`Session completed:`, mockSessions[sessionIndex]);
        return true;
      }

      console.log(`Session with ID ${sessionId} not found`);
      return false;
    } catch (error) {
      console.error("Error completing session:", error);
      return false;
    }
  }, []);

  // Get session statistics
  const getSessionStats = useCallback(async (days = 7) => {
    try {
      console.log(`Getting session stats for last ${days} days`);
      console.log(`Total sessions in memory: ${mockSessions.length}`);
      console.log(`All sessions:`, mockSessions);

      const now = Math.floor(Date.now() / 1000);
      const cutoffTime = now - days * 86400;

      const filteredSessions = mockSessions.filter(
        (s) => s.completed && (s.end_time || 0) > cutoffTime
      );
      console.log(
        `Filtered sessions (completed & within timeframe): ${filteredSessions.length}`,
        filteredSessions
      );

      const stats = filteredSessions.reduce((acc, session) => {
        const type = session.type;
        if (!acc[type]) {
          acc[type] = { count: 0, total_duration: 0 };
        }
        acc[type].count += 1;
        acc[type].total_duration += session.duration;
        return acc;
      }, {} as Record<string, { count: number; total_duration: number }>);

      const result = Object.entries(stats).map(([type, data]) => ({
        type,
        count: data.count,
        total_duration: data.total_duration,
      }));

      console.log(`Session stats result:`, result);
      return result;
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

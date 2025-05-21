import { useCallback } from "react";
import { useSessionOperations } from "../contexts/DatabaseContext";
import { TimerType, useTimerStore } from "../stores/timerStore";

export function useSessionsData() {
  const sessionOperations = useSessionOperations();
  const { setSessionId } = useTimerStore();

  // Start a new session
  const startSession = useCallback(
    async (taskId: number | null, type: TimerType, duration: number) => {
      try {
        const sessionId = await sessionOperations.startSession(
          taskId,
          type,
          duration
        );
        if (sessionId) {
          setSessionId(sessionId as number);
          return sessionId;
        }
        return null;
      } catch (error) {
        console.error("Error starting session:", error);
        return null;
      }
    },
    [sessionOperations, setSessionId]
  );

  // Complete a session
  const completeSession = useCallback(
    async (sessionId: number) => {
      try {
        const success = await sessionOperations.completeSession(sessionId);
        if (success) {
          setSessionId(null);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error completing session:", error);
        return false;
      }
    },
    [sessionOperations, setSessionId]
  );

  // Get session statistics
  const getSessionStats = useCallback(
    async (days = 7) => {
      try {
        return await sessionOperations.getSessionStats(days);
      } catch (error) {
        console.error("Error fetching session stats:", error);
        return [];
      }
    },
    [sessionOperations]
  );

  // Get sessions by day for statistics
  const getSessionsByDay = useCallback(
    async (days = 7) => {
      try {
        return await sessionOperations.getSessionsByDay(days);
      } catch (error) {
        console.error("Error fetching sessions by day:", error);
        return [];
      }
    },
    [sessionOperations]
  );

  // Get all sessions for a specific task
  const getTaskSessions = useCallback(
    async (taskId: number) => {
      try {
        return await sessionOperations.getTaskSessions(taskId);
      } catch (error) {
        console.error("Error fetching task sessions:", error);
        return [];
      }
    },
    [sessionOperations]
  );

  return {
    startSession,
    completeSession,
    getSessionStats,
    getSessionsByDay,
    getTaskSessions,
  };
}

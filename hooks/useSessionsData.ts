import { useCallback, useState } from "react";
import { timeSessionService } from "../db/services";

// Types
export interface Session {
  id: number;
  task_id: number | null;
  start_time: number;
  end_time: number;
  duration: number;
  type: "work" | "short_break" | "long_break";
  completed: boolean;
}

export interface SessionStat {
  type: string;
  count: number;
  total_duration: number;
}

// Simple event emitter for session updates
type SessionEventType = "session_completed" | "session_started";
type SessionEventCallback = () => void;

class SessionEventEmitter {
  private listeners: Map<SessionEventType, SessionEventCallback[]> = new Map();

  on(event: SessionEventType, callback: SessionEventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: SessionEventType, callback: SessionEventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: SessionEventType) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback());
    }
  }
}

export const sessionEvents = new SessionEventEmitter();

export const useSessionsData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  // Convert database session to app session format
  const convertDbSessionToAppSession = (dbSession: any): Session => ({
    id: dbSession.id,
    task_id: dbSession.task_id,
    start_time: new Date(dbSession.start_time).getTime(),
    end_time: new Date(dbSession.end_time).getTime(),
    duration: dbSession.duration_minutes * 60, // Convert minutes to seconds
    type: dbSession.category as "work" | "short_break" | "long_break",
    completed: true, // DB sessions are always completed
  });

  // Load sessions from database
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const dbSessions = await timeSessionService.getAll();
      const appSessions = dbSessions.map(convertDbSessionToAppSession);
      setSessions(appSessions);
      return appSessions;
    } catch (error) {
      console.error("Error loading sessions:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const startSession = useCallback(
    async (
      type: "work" | "short_break" | "long_break",
      duration: number,
      taskId?: number
    ) => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + duration * 1000);

      const newSession: Session = {
        id: Date.now(), // Temporary ID
        type,
        duration,
        start_time: startTime.getTime(),
        end_time: endTime.getTime(),
        task_id: taskId || null,
        completed: false,
      };

      setSessions((prev) => [...prev, newSession]);
      return newSession.id;
    },
    []
  );

  const completeSession = useCallback(
    async (sessionId: number, actualDuration?: number) => {
      try {
        setLoading(true);

        // Find the session in local state
        const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
        if (sessionIndex === -1) return;

        const session = sessions[sessionIndex];
        const endTime = new Date();
        const startTime = new Date(session.start_time);
        const duration =
          actualDuration || (endTime.getTime() - startTime.getTime()) / 1000;

        // Save to database
        await timeSessionService.create({
          task_id: session.task_id,
          category: session.type,
          duration_minutes: duration / 60,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          notes: null,
        });

        // Update local state
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex] = {
          ...session,
          end_time: endTime.getTime(),
          duration,
          completed: true,
        };
        setSessions(updatedSessions);

        // Emit event to notify other components
        sessionEvents.emit("session_completed");

        return true;
      } catch (error) {
        console.error("Error completing session:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [sessions]
  );

  const getSessionStats = useCallback(
    async (days: number = 7): Promise<SessionStat[]> => {
      try {
        setLoading(true);

        // Load fresh data from database
        const dbSessions = await timeSessionService.getAll();
        const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

        const recentSessions = dbSessions.filter((session) => {
          const sessionTime = new Date(session.end_time).getTime();
          return sessionTime >= cutoffTime;
        });

        // Group by category and calculate totals
        const stats = recentSessions.reduce((acc, session) => {
          const type = session.category;
          if (!acc[type]) {
            acc[type] = { count: 0, total_duration: 0 };
          }
          acc[type].count++;
          acc[type].total_duration += session.duration_minutes * 60; // Convert to seconds
          return acc;
        }, {} as Record<string, { count: number; total_duration: number }>);

        // Convert to array format
        const result = Object.entries(stats).map(([type, data]) => ({
          type,
          count: data.count,
          total_duration: data.total_duration,
        }));

        return result;
      } catch (error) {
        console.error("Error getting session stats:", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Helper function to create sample sessions for testing
  const createSampleSessions = useCallback(async () => {
    try {
      setLoading(true);

      const now = Date.now();
      const today = new Date();
      const sampleSessions = [
        // Today's sessions
        {
          task_id: null,
          category: "work",
          duration_minutes: 25,
          start_time: new Date(
            today.getTime() - 2 * 60 * 60 * 1000
          ).toISOString(), // 2 hours ago
          end_time: new Date(
            today.getTime() - 2 * 60 * 60 * 1000 + 25 * 60 * 1000
          ).toISOString(),
          notes: null,
        },
        {
          task_id: null,
          category: "short_break",
          duration_minutes: 5,
          start_time: new Date(today.getTime() - 90 * 60 * 1000).toISOString(), // 90 mins ago
          end_time: new Date(
            today.getTime() - 90 * 60 * 1000 + 5 * 60 * 1000
          ).toISOString(),
          notes: null,
        },
        {
          task_id: null,
          category: "work",
          duration_minutes: 25,
          start_time: new Date(today.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour ago
          end_time: new Date(
            today.getTime() - 60 * 60 * 1000 + 25 * 60 * 1000
          ).toISOString(),
          notes: null,
        },
        // Yesterday's sessions
        {
          task_id: null,
          category: "work",
          duration_minutes: 25,
          start_time: new Date(
            today.getTime() - 24 * 60 * 60 * 1000
          ).toISOString(), // Yesterday
          end_time: new Date(
            today.getTime() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000
          ).toISOString(),
          notes: null,
        },
        {
          task_id: null,
          category: "long_break",
          duration_minutes: 15,
          start_time: new Date(
            today.getTime() - 23 * 60 * 60 * 1000
          ).toISOString(),
          end_time: new Date(
            today.getTime() - 23 * 60 * 60 * 1000 + 15 * 60 * 1000
          ).toISOString(),
          notes: null,
        },
      ];

      // Insert sample sessions
      for (const session of sampleSessions) {
        await timeSessionService.create(session);
      }

      console.log("Sample sessions created successfully");
      return true;
    } catch (error) {
      console.error("Error creating sample sessions:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sessions,
    loading,
    loadSessions,
    startSession,
    completeSession,
    getSessionStats,
    createSampleSessions,
  };
};

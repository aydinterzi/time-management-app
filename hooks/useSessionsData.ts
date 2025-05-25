import { useState } from "react";

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

// Mock data for development
let mockSessions: Session[] = [];
let sessionIdCounter = 1;

export const useSessionsData = () => {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);

  const startSession = (
    type: "work" | "short_break" | "long_break",
    duration: number,
    taskId?: number
  ) => {
    const newSession: Session = {
      id: sessionIdCounter++,
      type,
      duration,
      start_time: Date.now(),
      end_time: Date.now(), // Will be updated when completed
      task_id: taskId || null,
      completed: false,
    };

    mockSessions.push(newSession);
    setSessions([...mockSessions]);

    return newSession.id;
  };

  const completeSession = (sessionId: number) => {
    const sessionIndex = mockSessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex !== -1) {
      mockSessions[sessionIndex] = {
        ...mockSessions[sessionIndex],
        end_time: Date.now(),
        completed: true,
      };
      setSessions([...mockSessions]);
    }
  };

  const getSessionStats = (days: number = 7) => {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const recentSessions = mockSessions.filter(
      (session) => session.completed && session.end_time >= cutoffTime
    );

    // Group by type and calculate totals
    const stats = recentSessions.reduce((acc, session) => {
      const type = session.type;
      if (!acc[type]) {
        acc[type] = { count: 0, total_duration: 0 };
      }
      acc[type].count++;
      acc[type].total_duration += session.duration;
      return acc;
    }, {} as Record<string, { count: number; total_duration: number }>);

    // Convert to array format
    const result = Object.entries(stats).map(([type, data]) => ({
      type,
      count: data.count,
      total_duration: data.total_duration,
    }));

    return result;
  };

  return {
    sessions,
    startSession,
    completeSession,
    getSessionStats,
  };
};

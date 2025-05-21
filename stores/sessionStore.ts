import { create } from "zustand";

export interface Session {
  id: number;
  task_id: number | null;
  start_time: string;
  end_time: string | null;
  duration: number; // in seconds
  type: "work" | "short_break" | "long_break";
  completed: boolean;
}

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  setSessions: (sessions: Session[]) => void;
  setCurrentSession: (session: Session | null) => void;
  addSession: (session: Session) => void;
  updateSession: (sessionId: number, session: Partial<Session>) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSession: null,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (currentSession) => set({ currentSession }),
  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),
  updateSession: (sessionId, updatedSession) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, ...updatedSession } : session
      ),
    })),
}));

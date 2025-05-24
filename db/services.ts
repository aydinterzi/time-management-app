import { eq } from "drizzle-orm";
import { db } from "./client";
import type { NewTask, NewTimeSession } from "./schema";
import { tasks, timeSessions } from "./schema";

// Task operations
export const taskService = {
  // Get all tasks
  getAll: () => db.select().from(tasks),

  // Get tasks by completion status
  getByStatus: (completed: boolean) =>
    db.select().from(tasks).where(eq(tasks.completed, completed)),

  // Create a new task
  create: (task: NewTask) => db.insert(tasks).values(task),

  // Update a task
  update: (id: number, updates: Partial<NewTask>) =>
    db
      .update(tasks)
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where(eq(tasks.id, id)),

  // Toggle task completion
  toggleComplete: (id: number) =>
    db
      .update(tasks)
      .set({
        completed: true, // This should be toggled based on current state
        updated_at: new Date().toISOString(),
      })
      .where(eq(tasks.id, id)),

  // Delete a task
  delete: (id: number) => db.delete(tasks).where(eq(tasks.id, id)),
};

// Time session operations
export const timeSessionService = {
  // Get all time sessions
  getAll: () => db.select().from(timeSessions),

  // Get sessions by category
  getByCategory: (category: string) =>
    db.select().from(timeSessions).where(eq(timeSessions.category, category)),

  // Create a new time session
  create: (session: NewTimeSession) => db.insert(timeSessions).values(session),

  // Get sessions for a specific task
  getByTask: (taskId: number) =>
    db.select().from(timeSessions).where(eq(timeSessions.task_id, taskId)),

  // Delete a session
  delete: (id: number) =>
    db.delete(timeSessions).where(eq(timeSessions.id, id)),
};

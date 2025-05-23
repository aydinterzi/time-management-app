import { and, eq } from "drizzle-orm";
import { db } from "./client";
import type {
  NewHabit,
  NewHabitCompletion,
  NewTask,
  NewTimeSession,
} from "./schema";
import { habitCompletions, habits, tasks, timeSessions } from "./schema";

// Habit operations
export const habitService = {
  // Get all habits
  getAll: () => db.select().from(habits),

  // Create a new habit
  create: (habit: NewHabit) => db.insert(habits).values(habit),

  // Update a habit
  update: (id: number, updates: Partial<NewHabit>) =>
    db.update(habits).set(updates).where(eq(habits.id, id)),

  // Delete a habit
  delete: (id: number) => db.delete(habits).where(eq(habits.id, id)),

  // Get habit by id
  getById: (id: number) => db.select().from(habits).where(eq(habits.id, id)),
};

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

// Habit completion operations
export const habitCompletionService = {
  // Get all completions for a habit
  getByHabit: (habitId: number) =>
    db
      .select()
      .from(habitCompletions)
      .where(eq(habitCompletions.habit_id, habitId)),

  // Mark habit as completed for a date
  markComplete: (completion: NewHabitCompletion) =>
    db.insert(habitCompletions).values(completion),

  // Get completion for specific date
  getByDate: (habitId: number, date: string) =>
    db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habit_id, habitId),
          eq(habitCompletions.completed_date, date)
        )
      ),
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

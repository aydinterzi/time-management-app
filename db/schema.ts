import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Tasks table for todo items and productivity tasks
export const tasks = sqliteTable("tasks", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
  completed: int({ mode: "boolean" }).default(false),
  priority: text().default("medium"), // low, medium, high
  category: text(),
  due_date: text(),
  estimated_pomodoros: int().default(1),
  completed_pomodoros: int().default(0),
  created_at: text().default("CURRENT_TIMESTAMP"),
  updated_at: text().default("CURRENT_TIMESTAMP"),
});

// Time tracking sessions for productivity monitoring
export const timeSessions = sqliteTable("time_sessions", {
  id: int().primaryKey({ autoIncrement: true }),
  task_id: int(), // optional link to task
  category: text().notNull(), // work, study, break, etc.
  duration_minutes: real().notNull(),
  start_time: text().notNull(),
  end_time: text().notNull(),
  notes: text(),
  created_at: text().default("CURRENT_TIMESTAMP"),
});

// Infer types for use in the application
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type TimeSession = typeof timeSessions.$inferSelect;
export type NewTimeSession = typeof timeSessions.$inferInsert;

import { SQLiteDatabase, SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import React, { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const DB_NAME = "pomodoro.db";

// Define database migration function
async function initializeDatabase(db: SQLiteDatabase) {
  try {
    // Set user_version to track database schema version
    const { user_version: currentVersion } = await db.getFirstAsync<{
      user_version: number;
    }>("PRAGMA user_version");

    // If database is new or needs migration
    if (currentVersion < 1) {
      // Enable WAL mode for better performance
      await db.execAsync("PRAGMA journal_mode = WAL");

      // Create tasks table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          priority INTEGER DEFAULT 1,
          estimated_pomodoros INTEGER DEFAULT 1,
          completed_pomodoros INTEGER DEFAULT 0,
          completed BOOLEAN DEFAULT 0,
          created_at INTEGER DEFAULT (strftime('%s', 'now')),
          completed_at INTEGER
        )
      `);

      // Create sessions table to track pomodoro sessions
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER,
          start_time INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          end_time INTEGER,
          duration INTEGER NOT NULL,
          type TEXT NOT NULL, -- 'work', 'short_break', 'long_break'
          completed BOOLEAN DEFAULT 0,
          FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
        )
      `);

      // Create settings table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          work_duration INTEGER NOT NULL DEFAULT 1500, -- 25 minutes in seconds
          short_break_duration INTEGER NOT NULL DEFAULT 300, -- 5 minutes in seconds
          long_break_duration INTEGER NOT NULL DEFAULT 900, -- 15 minutes in seconds
          long_break_interval INTEGER NOT NULL DEFAULT 4, -- After 4 pomodoros
          auto_start_breaks BOOLEAN NOT NULL DEFAULT 0,
          auto_start_pomodoros BOOLEAN NOT NULL DEFAULT 0,
          sound_enabled BOOLEAN NOT NULL DEFAULT 1,
          vibration_enabled BOOLEAN NOT NULL DEFAULT 1,
          notification_enabled BOOLEAN NOT NULL DEFAULT 1
        )
      `);

      // Insert default settings
      await db.execAsync(`
        INSERT OR IGNORE INTO settings (id) VALUES (1)
      `);

      // Set the new version
      await db.execAsync("PRAGMA user_version = 1");
    }

    // Add any future migrations here...
    // if (currentVersion < 2) { ... }

    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}

// Create a provider component for the app
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  // Custom onInit handler to track database readiness
  const handleInit = async (db: SQLiteDatabase) => {
    const success = await initializeDatabase(db);
    setIsReady(success);
    return success;
  };

  if (!isReady) {
    return (
      <SQLiteProvider databaseName={DB_NAME} onInit={handleInit}>
        <DatabaseInitializer onReady={() => setIsReady(true)}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 10 }}>Initializing database...</Text>
          </View>
        </DatabaseInitializer>
      </SQLiteProvider>
    );
  }

  return <SQLiteProvider databaseName={DB_NAME}>{children}</SQLiteProvider>;
}

// Helper component to check when database is ready
function DatabaseInitializer({
  children,
  onReady,
}: {
  children: ReactNode;
  onReady: () => void;
}) {
  const db = useSQLiteContext();

  useEffect(() => {
    // This effect runs when the database context is available
    onReady();
  }, [db]);

  return <>{children}</>;
}

// Custom hooks for database operations

// Hook to access the database context
export function useDatabase() {
  return useSQLiteContext();
}

// Tasks CRUD operations
export function useTaskOperations() {
  const db = useDatabase();

  return {
    // Get all tasks
    getTasks: async (includeCompleted = false) => {
      const query = includeCompleted
        ? "SELECT * FROM tasks ORDER BY completed, created_at DESC"
        : "SELECT * FROM tasks WHERE completed = 0 ORDER BY created_at DESC";
      return await db.getAllAsync(query);
    },

    // Get a single task by ID
    getTaskById: async (id: number) => {
      return await db.getFirstAsync("SELECT * FROM tasks WHERE id = ?", id);
    },

    // Create a new task
    createTask: async (task: {
      title: string;
      description?: string;
      priority?: number;
      estimated_pomodoros?: number;
    }) => {
      const result = await db.runAsync(
        "INSERT INTO tasks (title, description, priority, estimated_pomodoros) VALUES (?, ?, ?, ?)",
        task.title,
        task.description || "",
        task.priority || 1,
        task.estimated_pomodoros || 1
      );
      return result.lastInsertRowId;
    },

    // Update a task
    updateTask: async (
      id: number,
      updates: Partial<{
        title: string;
        description: string;
        priority: number;
        estimated_pomodoros: number;
        completed_pomodoros: number;
        completed: boolean;
        completed_at: number;
      }>
    ) => {
      // Build dynamic update query
      const fields = Object.keys(updates);
      if (fields.length === 0) return false;

      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = [...Object.values(updates), id];

      const result = await db.runAsync(
        `UPDATE tasks SET ${setClause} WHERE id = ?`,
        ...values
      );

      return result.changes > 0;
    },

    // Delete a task
    deleteTask: async (id: number) => {
      const result = await db.runAsync("DELETE FROM tasks WHERE id = ?", id);
      return result.changes > 0;
    },

    // Mark task as completed
    completeTask: async (id: number) => {
      const result = await db.runAsync(
        "UPDATE tasks SET completed = 1, completed_at = ? WHERE id = ?",
        Math.floor(Date.now() / 1000),
        id
      );
      return result.changes > 0;
    },

    // Increment completed pomodoros for a task
    incrementPomodoro: async (id: number) => {
      const result = await db.runAsync(
        "UPDATE tasks SET completed_pomodoros = completed_pomodoros + 1 WHERE id = ?",
        id
      );
      return result.changes > 0;
    },
  };
}

// Session operations
export function useSessionOperations() {
  const db = useDatabase();

  return {
    // Start a new session
    startSession: async (
      taskId: number | null,
      type: "work" | "short_break" | "long_break",
      duration: number
    ) => {
      const result = await db.runAsync(
        "INSERT INTO sessions (task_id, type, duration) VALUES (?, ?, ?)",
        taskId,
        type,
        duration
      );
      return result.lastInsertRowId;
    },

    // Complete a session
    completeSession: async (id: number) => {
      const result = await db.runAsync(
        "UPDATE sessions SET completed = 1, end_time = ? WHERE id = ?",
        Math.floor(Date.now() / 1000),
        id
      );
      return result.changes > 0;
    },

    // Get session statistics
    getSessionStats: async (days = 7) => {
      const timestamp = Math.floor(Date.now() / 1000) - days * 86400;
      return await db.getAllAsync(
        `SELECT 
          type, 
          COUNT(*) as count, 
          SUM(duration) as total_duration
        FROM sessions 
        WHERE completed = 1 AND end_time > ? 
        GROUP BY type`,
        timestamp
      );
    },

    // Get all sessions for a specific task
    getTaskSessions: async (taskId: number) => {
      return await db.getAllAsync(
        "SELECT * FROM sessions WHERE task_id = ? ORDER BY start_time DESC",
        taskId
      );
    },

    // Get sessions by day (for statistics)
    getSessionsByDay: async (days = 7) => {
      const timestamp = Math.floor(Date.now() / 1000) - days * 86400;
      return await db.getAllAsync(
        `SELECT 
          date(end_time, 'unixepoch', 'localtime') as day,
          type,
          COUNT(*) as count
        FROM sessions 
        WHERE completed = 1 AND end_time > ? 
        GROUP BY day, type
        ORDER BY day`,
        timestamp
      );
    },
  };
}

// Settings operations
export function useSettingsOperations() {
  const db = useDatabase();

  return {
    // Get all settings
    getSettings: async () => {
      return await db.getFirstAsync("SELECT * FROM settings WHERE id = 1");
    },

    // Update settings
    updateSettings: async (
      updates: Partial<{
        work_duration: number;
        short_break_duration: number;
        long_break_duration: number;
        long_break_interval: number;
        auto_start_breaks: boolean;
        auto_start_pomodoros: boolean;
        sound_enabled: boolean;
        vibration_enabled: boolean;
        notification_enabled: boolean;
      }>
    ) => {
      // Build dynamic update query
      const fields = Object.keys(updates);
      if (fields.length === 0) return false;

      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = [...Object.values(updates)];

      const result = await db.runAsync(
        `UPDATE settings SET ${setClause} WHERE id = 1`,
        ...values
      );

      return result.changes > 0;
    },
  };
}

CREATE TABLE `habit_completions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`habit_id` integer NOT NULL,
	`completed_date` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`completed` integer DEFAULT false,
	`priority` text DEFAULT 'medium',
	`category` text,
	`due_date` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `time_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer,
	`category` text NOT NULL,
	`duration_minutes` real NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);

PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercise_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`reps` real,
	`weight` real,
	`duration` integer,
	`distance` real,
	`completed` integer DEFAULT false,
	`date` text DEFAULT '2026-04-02T16:16:53.281Z' NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `workout_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_exercise_logs`("id", "session_id", "exercise_id", "reps", "weight", "duration", "distance", "completed", "date") SELECT "id", "session_id", "exercise_id", "reps", "weight", "duration", "distance", "completed", "date" FROM `exercise_logs`;--> statement-breakpoint
DROP TABLE `exercise_logs`;--> statement-breakpoint
ALTER TABLE `__new_exercise_logs` RENAME TO `exercise_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`profile` text,
	`created_at` text DEFAULT '2026-04-02T16:16:53.279Z'
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "profile", "created_at") SELECT "id", "name", "profile", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE TABLE `__new_workout_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`days_per_week` integer NOT NULL,
	`split` text NOT NULL,
	`goal` text,
	`created_at` text DEFAULT '2026-04-02T16:16:53.280Z',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workout_plans`("id", "user_id", "days_per_week", "split", "goal", "created_at") SELECT "id", "user_id", "days_per_week", "split", "goal", "created_at" FROM `workout_plans`;--> statement-breakpoint
DROP TABLE `workout_plans`;--> statement-breakpoint
ALTER TABLE `__new_workout_plans` RENAME TO `workout_plans`;--> statement-breakpoint
CREATE TABLE `__new_workout_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`date` text DEFAULT '2026-04-02T16:16:53.281Z' NOT NULL,
	`perfect_day` integer DEFAULT false,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workout_sessions`("id", "user_id", "date", "perfect_day") SELECT "id", "user_id", "date", "perfect_day" FROM `workout_sessions`;--> statement-breakpoint
DROP TABLE `workout_sessions`;--> statement-breakpoint
ALTER TABLE `__new_workout_sessions` RENAME TO `workout_sessions`;--> statement-breakpoint
ALTER TABLE `workout_days` DROP COLUMN `target_duration`;